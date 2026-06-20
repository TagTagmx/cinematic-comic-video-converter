import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { DIRECTOR_RULEBOOK_PROMPT_SUMMARY } from "./src/lib/directorRulebook";

declare const process: {
  cwd(): string;
  env: Record<string, string | undefined>;
};

type NodeSocket = {
  destroy(): void;
  write(data: string): void;
  on(event: "data", listener: (chunk: Uint8Array) => void): void;
  on(event: "end", listener: () => void): void;
  on(event: "error", listener: (error: Error) => void): void;
  setTimeout(milliseconds: number, callback: () => void): void;
};

type NodeClientRequest = {
  end(): void;
  on(event: "connect", listener: (response: { statusCode?: number }, socket: NodeSocket) => void): void;
  on(event: "error", listener: (error: Error) => void): void;
  setTimeout(milliseconds: number, callback: () => void): void;
  destroy(error?: Error): void;
};

type NodeHttpModule = {
  request(options: Record<string, unknown>): NodeClientRequest;
};

type NodeTlsModule = {
  connect(options: Record<string, unknown>, callback: () => void): NodeSocket;
};

type LocalRequest = {
  method?: string;
  on(event: "data", listener: (chunk: Uint8Array) => void): void;
  on(event: "end", listener: () => void): void;
  on(event: "error", listener: (error: Error) => void): void;
  destroy(): void;
};

type LocalResponse = {
  statusCode: number;
  setHeader(name: string, value: string): void;
  end(value: string): void;
};

const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";
const MAX_OUTPUT_TOKENS = 16000;
const MAX_REQUEST_BYTES = 9_000_000;
const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const OPENAI_RESPONSES_HOST = "api.openai.com";
const OPENAI_RESPONSES_PATH = "/v1/responses";
const OPENAI_RESPONSES_PORT = 443;
const OPENAI_REQUEST_TIMEOUT_MS = 45_000;

export default defineConfig(({ mode }) => {
  const localEnv = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), localAiPageUnderstandingPlugin(localEnv)],
  };
});

function localAiPageUnderstandingPlugin(
  localEnv: Record<string, string | undefined>,
): Plugin {
  return {
    name: "local-ai-page-understanding-proxy",
    configureServer(server) {
      server.middlewares.use("/api/analyze-page", (request, response) => {
        void handleAnalyzePageRequest(
          request as unknown as LocalRequest,
          response as unknown as LocalResponse,
          localEnv,
        );
      });
      server.middlewares.use("/api/generate-director-suggestions", (request, response) => {
        void handleGenerateDirectorSuggestionsRequest(
          request as unknown as LocalRequest,
          response as unknown as LocalResponse,
          localEnv,
        );
      });
    },
  };
}

async function handleAnalyzePageRequest(
  request: LocalRequest,
  response: LocalResponse,
  localEnv: Record<string, string | undefined>,
) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Use POST for page analysis." });
    return;
  }

  const apiKey =
    process.env.OPENAI_API_KEY ?? localEnv.OPENAI_API_KEY ?? "";

  if (!apiKey) {
    sendJson(response, 500, {
      error:
        "OPENAI_API_KEY is not available to the local provider proxy. Add it to .env.local and restart the dev server.",
    });
    return;
  }

  const model = getAiPageUnderstandingModel(localEnv);

  try {
    const body = parseAnalyzePageRequest(
      JSON.parse(await readRequestBody(request, MAX_REQUEST_BYTES)),
    );
    const startedAt = Date.now();
    console.info("[ai-page-understanding] model", {
      model,
      configuredBy: getAiPageUnderstandingModelSource(localEnv),
    });
    const openAiRequestBody = JSON.stringify({
      model,
      max_output_tokens: MAX_OUTPUT_TOKENS,
      text: {
        format: {
          type: "json_schema",
          name: "comic_page_understanding",
          strict: true,
          schema: createPageUnderstandingJsonSchema(),
        },
      },
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: createPageUnderstandingPrompt(body),
            },
            {
              type: "input_image",
              image_url: body.compressedImageDataUrl,
            },
          ],
        },
      ],
    });
    const openAiHeaders = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
    const outboundProxyUrl = getOutboundProxyUrl(localEnv);
    if (outboundProxyUrl) {
      console.info(
        "[ai-page-understanding] using outbound proxy",
        redactProxyUrl(outboundProxyUrl),
      );
    }

    const responseJson = outboundProxyUrl
      ? await postOpenAiViaHttpProxy(
          outboundProxyUrl,
          openAiRequestBody,
          openAiHeaders,
        )
      : await postOpenAiDirect(openAiRequestBody, openAiHeaders);

    if (!responseJson.ok) {
      sendJson(response, responseJson.status, {
        error: getProviderErrorMessage(responseJson.body),
        providerModel: model,
      });
      return;
    }

    const outputText = getOutputText(responseJson.body);
    const analysis = parseAnalysisJson(outputText, responseJson.body);
    const usage = createUsageSummary(responseJson.body, model);

    if (usage) {
      console.info("[ai-page-understanding] usage", {
        model,
        proxy: outboundProxyUrl ? redactProxyUrl(outboundProxyUrl) : "direct",
        ...usage,
        elapsedMs: Date.now() - startedAt,
      });
    }

    sendJson(response, 200, {
      id: `ai-page-${Date.now()}`,
      source: "openai",
      providerModel: model,
      createdAt: new Date().toISOString(),
      image: {
        ...body.image,
        analyzedWidth: body.compressedImageWidth,
        analyzedHeight: body.compressedImageHeight,
      },
      analysis,
      usage,
    });
  } catch (error) {
    const errorMessage = getLocalProxyErrorMessage(error);

    console.error("[ai-page-understanding] local proxy error", error);
    sendJson(response, 400, {
      error: errorMessage,
      providerModel: model,
    });
  }
}

async function handleGenerateDirectorSuggestionsRequest(
  request: LocalRequest,
  response: LocalResponse,
  localEnv: Record<string, string | undefined>,
) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Use POST for director suggestions." });
    return;
  }

  const apiKey =
    process.env.OPENAI_API_KEY ?? localEnv.OPENAI_API_KEY ?? "";

  if (!apiKey) {
    sendJson(response, 500, {
      error:
        "OPENAI_API_KEY is not available to the local provider proxy. Add it to .env.local and restart the dev server.",
    });
    return;
  }

  const model = getAiPageUnderstandingModel(localEnv);

  try {
    const body = parseGenerateDirectorSuggestionsRequest(
      JSON.parse(await readRequestBody(request, MAX_REQUEST_BYTES)),
    );
    const startedAt = Date.now();
    console.info("[ai-director-suggestions] model", {
      model,
      configuredBy: getAiPageUnderstandingModelSource(localEnv),
    });
    const openAiRequestBody = JSON.stringify({
      model,
      max_output_tokens: MAX_OUTPUT_TOKENS,
      text: {
        format: {
          type: "json_schema",
          name: "comic_director_suggestions",
          strict: true,
          schema: createDirectorSuggestionsJsonSchema(),
        },
      },
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: createDirectorSuggestionsPrompt(body),
            },
          ],
        },
      ],
    });
    const openAiHeaders = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
    const outboundProxyUrl = getOutboundProxyUrl(localEnv);
    if (outboundProxyUrl) {
      console.info(
        "[ai-director-suggestions] using outbound proxy",
        redactProxyUrl(outboundProxyUrl),
      );
    }

    const responseJson = outboundProxyUrl
      ? await postOpenAiViaHttpProxy(
          outboundProxyUrl,
          openAiRequestBody,
          openAiHeaders,
        )
      : await postOpenAiDirect(openAiRequestBody, openAiHeaders);

    if (!responseJson.ok) {
      sendJson(response, responseJson.status, {
        error: getProviderErrorMessage(responseJson.body),
        providerModel: model,
      });
      return;
    }

    const outputText = getOutputText(responseJson.body);
    const directorSuggestions = parseAnalysisJson(outputText, responseJson.body);
    const usage = createUsageSummary(responseJson.body, model);

    if (usage) {
      console.info("[ai-director-suggestions] usage", {
        model,
        proxy: outboundProxyUrl ? redactProxyUrl(outboundProxyUrl) : "direct",
        ...usage,
        elapsedMs: Date.now() - startedAt,
      });
    }

    sendJson(response, 200, {
      id: `ai-director-${Date.now()}`,
      source: "openai",
      providerModel: model,
      createdAt: new Date().toISOString(),
      pageUnderstandingId: body.pageUnderstanding.id,
      suggestions: isRecord(directorSuggestions)
        ? directorSuggestions.suggestions
        : [],
      usage,
    });
  } catch (error) {
    const errorMessage = getLocalProxyErrorMessage(error);

    console.error("[ai-director-suggestions] local proxy error", error);
    sendJson(response, 400, {
      error: errorMessage,
      providerModel: model,
    });
  }
}

function getAiPageUnderstandingModel(
  localEnv: Record<string, string | undefined>,
) {
  return (
    localEnv.OPENAI_AI_PAGE_MODEL ||
    process.env.OPENAI_AI_PAGE_MODEL ||
    localEnv.OPENAI_PAGE_UNDERSTANDING_MODEL ||
    process.env.OPENAI_PAGE_UNDERSTANDING_MODEL ||
    DEFAULT_OPENAI_MODEL
  );
}

function getAiPageUnderstandingModelSource(
  localEnv: Record<string, string | undefined>,
) {
  if (localEnv.OPENAI_AI_PAGE_MODEL || process.env.OPENAI_AI_PAGE_MODEL) {
    return "OPENAI_AI_PAGE_MODEL";
  }

  if (
    localEnv.OPENAI_PAGE_UNDERSTANDING_MODEL ||
    process.env.OPENAI_PAGE_UNDERSTANDING_MODEL
  ) {
    return "OPENAI_PAGE_UNDERSTANDING_MODEL";
  }

  return "default";
}

async function postOpenAiDirect(
  requestBody: string,
  headers: Record<string, string>,
) {
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort(
      new Error("Provider timeout while connecting to OpenAI."),
    );
  }, OPENAI_REQUEST_TIMEOUT_MS);
  const openAiResponse = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers,
    body: requestBody,
    signal: abortController.signal,
  }).finally(() => clearTimeout(timeoutId));
  const body = await openAiResponse.json();

  return {
    ok: openAiResponse.ok,
    status: openAiResponse.status,
    body,
  };
}

async function postOpenAiViaHttpProxy(
  proxyUrl: string,
  requestBody: string,
  headers: Record<string, string>,
) {
  const proxy = parseHttpProxyUrl(proxyUrl);
  const socket = await createProxyTunnel(proxy);
  const tlsSocket = await createTlsSocket(socket);
  const requestText = [
    `POST ${OPENAI_RESPONSES_PATH} HTTP/1.1`,
    `Host: ${OPENAI_RESPONSES_HOST}`,
    "Connection: close",
    `Content-Length: ${new TextEncoder().encode(requestBody).length}`,
    ...Object.entries(headers).map(([name, value]) => `${name}: ${value}`),
    "",
    requestBody,
  ].join("\r\n");

  tlsSocket.write(requestText);

  const responseBytes = await readSocketToEnd(tlsSocket);
  const parsedResponse = parseHttpResponse(responseBytes);

  return {
    ok: parsedResponse.status >= 200 && parsedResponse.status < 300,
    status: parsedResponse.status,
    body: JSON.parse(decodeUtf8(parsedResponse.body) || "{}"),
  };
}

async function createProxyTunnel(proxy: ParsedHttpProxy) {
  const httpModule = await importNodeModule("node:http") as NodeHttpModule;

  return new Promise<NodeSocket>((resolve, reject) => {
    const request = httpModule.request({
      host: proxy.hostname,
      port: proxy.port,
      method: "CONNECT",
      path: `${OPENAI_RESPONSES_HOST}:${OPENAI_RESPONSES_PORT}`,
      headers: proxy.authorization
        ? { "Proxy-Authorization": proxy.authorization }
        : undefined,
    });

    request.setTimeout(OPENAI_REQUEST_TIMEOUT_MS, () => {
      request.destroy(new Error("Provider timeout while connecting to HTTP proxy."));
    });
    request.on("connect", (proxyResponse, socket) => {
      if (proxyResponse.statusCode !== 200) {
        socket.destroy();
        reject(
          new Error(
            `HTTP proxy CONNECT failed with status ${proxyResponse.statusCode ?? "unknown"}.`,
          ),
        );
        return;
      }

      socket.setTimeout(OPENAI_REQUEST_TIMEOUT_MS, () => {
        socket.destroy();
        reject(new Error("Provider timeout while using HTTP proxy tunnel."));
      });
      resolve(socket);
    });
    request.on("error", reject);
    request.end();
  });
}

async function createTlsSocket(socket: NodeSocket) {
  const tlsModule = await importNodeModule("node:tls") as NodeTlsModule;

  return new Promise<NodeSocket>((resolve, reject) => {
    const tlsSocket = tlsModule.connect(
      {
        socket,
        servername: OPENAI_RESPONSES_HOST,
      },
      () => resolve(tlsSocket),
    );

    tlsSocket.setTimeout(OPENAI_REQUEST_TIMEOUT_MS, () => {
      tlsSocket.destroy();
      reject(new Error("Provider timeout while connecting through HTTP proxy."));
    });
    tlsSocket.on("error", reject);
  });
}

function readSocketToEnd(socket: NodeSocket) {
  return new Promise<Uint8Array>((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;

    socket.on("data", (chunk) => {
      chunks.push(chunk);
      totalBytes += chunk.length;
    });
    socket.on("end", () => resolve(concatBytes(chunks, totalBytes)));
    socket.on("error", reject);
  });
}

function parseHttpResponse(responseBytes: Uint8Array) {
  const headerEndIndex = findByteSequence(
    responseBytes,
    new Uint8Array([13, 10, 13, 10]),
  );

  if (headerEndIndex < 0) {
    throw new Error("Bad provider response: missing HTTP headers.");
  }

  const headerText = decodeAscii(responseBytes.slice(0, headerEndIndex));
  const rawBody = responseBytes.slice(headerEndIndex + 4);
  const statusMatch = /^HTTP\/\d(?:\.\d)?\s+(\d+)/.exec(headerText);
  const status = statusMatch ? Number(statusMatch[1]) : 0;

  if (!Number.isFinite(status) || status <= 0) {
    throw new Error("Bad provider response: missing HTTP status.");
  }

  return {
    status,
    body: /transfer-encoding:\s*chunked/i.test(headerText)
      ? decodeChunkedBody(rawBody)
      : rawBody,
  };
}

type ParsedHttpProxy = {
  hostname: string;
  port: number;
  authorization?: string;
};

function parseHttpProxyUrl(proxyUrl: string): ParsedHttpProxy {
  const parsedProxy = new URL(proxyUrl);

  if (parsedProxy.protocol !== "http:") {
    throw new Error(
      "Only http:// outbound proxies are supported for AI_HTTP_PROXY / HTTPS_PROXY.",
    );
  }

  const authorization =
    parsedProxy.username || parsedProxy.password
      ? `Basic ${encodeBase64(`${decodeURIComponent(parsedProxy.username)}:${decodeURIComponent(parsedProxy.password)}`)}`
      : undefined;

  return {
    hostname: parsedProxy.hostname,
    port: parsedProxy.port ? Number(parsedProxy.port) : 80,
    authorization,
  };
}

function getOutboundProxyUrl(localEnv: Record<string, string | undefined>) {
  return (
    process.env.AI_HTTP_PROXY ||
    localEnv.AI_HTTP_PROXY ||
    process.env.HTTPS_PROXY ||
    localEnv.HTTPS_PROXY ||
    process.env.HTTP_PROXY ||
    localEnv.HTTP_PROXY ||
    ""
  ).trim();
}

function redactProxyUrl(proxyUrl: string) {
  try {
    const parsedProxy = new URL(proxyUrl);

    if (parsedProxy.username || parsedProxy.password) {
      parsedProxy.username = "***";
      parsedProxy.password = "***";
    }

    return parsedProxy.toString();
  } catch {
    return "configured";
  }
}

function encodeBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let output = "";

  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index];
    const second = bytes[index + 1];
    const third = bytes[index + 2];
    const combined =
      (first << 16) | ((second ?? 0) << 8) | (third ?? 0);

    output += alphabet[(combined >> 18) & 63];
    output += alphabet[(combined >> 12) & 63];
    output += second === undefined ? "=" : alphabet[(combined >> 6) & 63];
    output += third === undefined ? "=" : alphabet[combined & 63];
  }

  return output;
}

function decodeChunkedBody(rawBody: Uint8Array) {
  let offset = 0;
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (offset < rawBody.length) {
    const lineEndIndex = findByteSequence(
      rawBody,
      new Uint8Array([13, 10]),
      offset,
    );

    if (lineEndIndex < 0) {
      throw new Error("Bad provider response: incomplete chunked body.");
    }

    const sizeText = decodeAscii(rawBody.slice(offset, lineEndIndex)).split(
      ";",
      1,
    )[0];
    const size = Number.parseInt(sizeText, 16);

    if (!Number.isFinite(size)) {
      throw new Error("Bad provider response: invalid chunked body.");
    }

    offset = lineEndIndex + 2;

    if (size === 0) {
      return concatBytes(chunks, totalBytes);
    }

    if (offset + size > rawBody.length) {
      throw new Error("Bad provider response: incomplete chunked body.");
    }

    const chunk = rawBody.slice(offset, offset + size);
    chunks.push(chunk);
    totalBytes += chunk.length;
    offset += size;

    if (rawBody[offset] !== 13 || rawBody[offset + 1] !== 10) {
      throw new Error("Bad provider response: invalid chunked body terminator.");
    }

    offset += 2;
  }

  return concatBytes(chunks, totalBytes);
}

function importNodeModule(moduleName: string) {
  return Function("moduleName", "return import(moduleName)")(moduleName) as Promise<unknown>;
}

function createPageUnderstandingPrompt(body: AnalyzePageRequestBody) {
  const projectContext = {
    sourceImage: body.image,
    analyzedImage: {
      width: body.compressedImageWidth,
      height: body.compressedImageHeight,
    },
    acceptedCameraShots: body.cameraShots.map((shot) => ({
      id: shot.id,
      label: shot.label,
      x: shot.x,
      y: shot.y,
      width: shot.width,
      height: shot.height,
      durationMs: shot.durationMs,
      shotPurpose: shot.shotPurpose,
      attentionPathCount: Array.isArray(shot.attentionPath)
        ? shot.attentionPath.length
        : 0,
    })),
    acceptedFocusRegions: body.focusRegions.map((region) => ({
      id: region.id,
      label: region.label,
      kind: region.kind,
      x: region.x,
      y: region.y,
      width: region.width,
      height: region.height,
      sequenceOrder: region.sequenceOrder,
    })),
  };

  return [
    "Analyze this comic page for temporary authoring review.",
    "Return concise structured JSON only, matching the provided schema.",
    'Use schemaName exactly "comicPageUnderstanding" and schemaVersion exactly 1.',
    'Use top-level "mood"; do not use "pageMood".',
    'All confidence values must be strings: "high", "medium", "low", or "unknown". Do not return numeric confidence.',
    "Use analyzed-image pixel coordinates for every region geometry.",
    'Set region.geometrySpace to "analyzedImage" for every region.',
    'Do not put geometrySpace inside the geometry object; geometry may contain only x, y, width, and height.',
    "For character, speech, detail, and action regions, set panelId to the matching panel id when clear; otherwise set panelId to null.",
    "Do not create accepted project data. Do not instruct automatic mutation.",
    "Identify likely panels, reading order, character or face regions, speech regions, detail regions, action regions, page mood, confidence, and warnings.",
    "Keep descriptions short and evidence-based.",
    `Project context: ${JSON.stringify(projectContext)}`,
  ].join("\n");
}

function createPageUnderstandingJsonSchema() {
  const confidenceEnum = ["high", "medium", "low", "unknown"];
  const regionSchema = {
    type: "object",
    additionalProperties: false,
    required: [
      "id",
      "label",
      "kind",
      "geometry",
      "geometrySpace",
      "panelId",
      "confidence",
      "description",
      "warnings",
    ],
    properties: {
      id: { type: "string" },
      label: { type: "string" },
      kind: {
        type: "string",
        enum: [
          "panel",
          "character",
          "face",
          "speech",
          "detail",
          "action",
          "establishing",
          "background",
          "other",
        ],
      },
      geometry: {
        type: "object",
        additionalProperties: false,
        required: ["x", "y", "width", "height"],
        properties: {
          x: { type: "number" },
          y: { type: "number" },
          width: { type: "number" },
          height: { type: "number" },
        },
      },
      geometrySpace: { type: "string", enum: ["analyzedImage"] },
      panelId: { type: ["string", "null"] },
      confidence: { type: "string", enum: confidenceEnum },
      description: { type: "string" },
      warnings: { type: "array", items: { type: "string" } },
    },
  };

  return {
    type: "object",
    additionalProperties: false,
    required: [
      "schemaName",
      "schemaVersion",
      "pageSummary",
      "mood",
      "readingOrder",
      "panels",
      "characterRegions",
      "speechRegions",
      "detailRegions",
      "actionRegions",
      "warnings",
    ],
    properties: {
      schemaName: { type: "string", enum: ["comicPageUnderstanding"] },
      schemaVersion: { type: "number", enum: [1] },
      pageSummary: { type: "string" },
      mood: {
        type: "object",
        additionalProperties: false,
        required: ["label", "confidence", "reason"],
        properties: {
          label: { type: "string" },
          confidence: { type: "string", enum: confidenceEnum },
          reason: { type: "string" },
        },
      },
      readingOrder: { type: "array", items: { type: "string" } },
      panels: { type: "array", maxItems: 12, items: regionSchema },
      characterRegions: { type: "array", maxItems: 12, items: regionSchema },
      speechRegions: { type: "array", maxItems: 12, items: regionSchema },
      detailRegions: { type: "array", maxItems: 12, items: regionSchema },
      actionRegions: { type: "array", maxItems: 12, items: regionSchema },
      warnings: { type: "array", items: { type: "string" } },
    },
  };
}

function createDirectorSuggestionsPrompt(body: GenerateDirectorSuggestionsRequestBody) {
  const pageUnderstanding = body.pageUnderstanding;
  const analysis = pageUnderstanding.analysis;
  const regions = {
    panels: analysis.panels,
    characterRegions: analysis.characterRegions,
    speechRegions: analysis.speechRegions,
    detailRegions: analysis.detailRegions,
    actionRegions: analysis.actionRegions,
  };
  const directorContext = {
    pageUnderstandingId: pageUnderstanding.id,
    pageSummary: analysis.pageSummary,
    pageMood: analysis.mood,
    readingOrder: analysis.readingOrder,
    regions,
    acceptedContext: body.acceptedContext,
    regionGeometryNote:
      "Panel boxes are primary. Character, speech, detail, and action boxes are approximate semantic hints.",
  };

  return [
    "Generate temporary AI Director Suggestion cards from this existing comic page understanding result.",
    "Return structured JSON only, matching the provided schema.",
    "Do not create, edit, or recommend automatic mutation of accepted Camera Shots, Focus Regions, Shot Attention Paths, Project JSON, preview, export, audio, or SFX markers.",
    "These are review-only ideas.",
    "Apply this Director Rulebook v1 guidance:",
    DIRECTOR_RULEBOOK_PROMPT_SUMMARY,
    "Accepted context, when present, outranks raw AI page-understanding boxes. Prefer accepted details, accepted Camera Shots, accepted Focus Regions, and accepted path beats over raw region confidence.",
    "Use panel boxes first. Treat character, speech, detail, and action boxes as approximate hints and say so in warning when needed.",
    "Comic-reading hierarchy: the page is a continuous reading sequence; each detected panel is normally one draft shot in reading order.",
    "Do not treat detections as separate shots. Do not create multiple suggestions from one panel unless it is unusually large or clearly contains separate story beats.",
    "Focus Regions are optional internal guidance. If the panel shot already frames the intended subject, do not ask for another focus region over the same area.",
    "Shot attention paths are only for meaningful internal movement: usually 0 or 1 internal beat, 2 only for speaker-to-speaker, setup-to-payoff, or action-to-reaction.",
    "Consider previous and next panels. Continuing character/action/conversation should use restrained continuity: track, hold, or soft push rather than repeated aggressive push-ins.",
    "Detections are not directing beats. Before suggesting motion, mentally consolidate overlapping or nearby FACE / ACTION / DETAIL detections in the same panel into one local story beat.",
    "When FACE, ACTION, and DETAIL boxes overlap around one character or event, emit one primary motion suggestion for the dominant beat and list the non-dominant detections only as supporting referencedRegionIds.",
    "Do not create separate camera motions for attached detail/face/action boxes unless they are visually separate or story-critical.",
    "Camera grammar:",
    "- track: stable-scale pan/glide between Focus Region targets. Use for normal reading flow, subject-to-subject movement, speech-to-reaction, scanning details, wide horizontal/vertical action, and reader eye guidance.",
    "- pushIn: deliberate zoom toward a subject/detail only when the moment needs emotional emphasis, reaction, threat, realization, inspection, or punchline intensity.",
    "- pushOut: deliberate zoom away from a subject/detail only when the moment needs context restoration, environment reveal, relationship reveal, or scene establishment/resolution.",
    "Article-inspired camera rules:",
    "- Panning/track calmly shifts audience focus from one subject/location to another.",
    "- Multiple ROIs should usually use track in reading order unless there is a clear meaning reason for pushIn or pushOut.",
    "- Zoom/pushIn highlights character reaction, emotion, threat, realization, or inspectable detail.",
    "- Zoom/pushOut puts a character/detail back into context or reveals relationships/environment.",
    "- Multiple ROIs should be visited in reading order.",
    "- Avoid over-directing: do not assign pushIn or pushOut to every Focus Region transition.",
    "- Strong motion, motion lines, or frantic action justify faster camera movement.",
    "- Calm or exposition panels should use slower/subtler movement.",
    "For each suggestion, target one known panel id from the panels list. Reference available AI region ids in referencedRegionIds when useful.",
    "Use only suggestedCameraMotion values: track, pushIn, pushOut.",
    "Use only suggestedSpeedTiming values: slow, medium, fast.",
    "Include an optional SFX/BGM note only when the page understanding supports it.",
    `Director context: ${JSON.stringify(directorContext)}`,
  ].join("\n");
}

function createDirectorSuggestionsJsonSchema() {
  const confidenceEnum = ["high", "medium", "low", "unknown"];

  return {
    type: "object",
    additionalProperties: false,
    required: ["suggestions"],
    properties: {
      suggestions: {
        type: "array",
        maxItems: 16,
        items: {
          type: "object",
          additionalProperties: false,
          required: [
            "id",
            "targetPanelId",
            "targetPanelLabel",
            "panelSummary",
            "moodMotionInterpretation",
            "suggestedCameraMotion",
            "suggestedAttentionPath",
            "referencedRegionIds",
            "suggestedSpeedTiming",
            "sfxBgmNote",
            "confidence",
            "reason",
            "warning",
          ],
          properties: {
            id: { type: "string" },
            targetPanelId: { type: "string" },
            targetPanelLabel: { type: "string" },
            panelSummary: { type: "string" },
            moodMotionInterpretation: { type: "string" },
            suggestedCameraMotion: {
              type: "string",
              enum: ["track", "pushIn", "pushOut"],
            },
            suggestedAttentionPath: { type: "string" },
            referencedRegionIds: {
              type: "array",
              items: { type: "string" },
            },
            suggestedSpeedTiming: {
              type: "string",
              enum: ["slow", "medium", "fast"],
            },
            sfxBgmNote: { type: ["string", "null"] },
            confidence: { type: "string", enum: confidenceEnum },
            reason: { type: "string" },
            warning: { type: ["string", "null"] },
          },
        },
      },
    },
  };
}

type AnalyzePageRequestBody = {
  image: {
    fileName: string;
    width: number;
    height: number;
    mimeType: string;
  };
  compressedImageDataUrl: string;
  compressedImageWidth: number;
  compressedImageHeight: number;
  cameraShots: Array<Record<string, unknown>>;
  focusRegions: Array<Record<string, unknown>>;
};

type GenerateDirectorSuggestionsRequestBody = {
  pageUnderstanding: {
    id: string;
    providerModel: string;
    analysis: {
      pageSummary: string;
      mood: Record<string, unknown>;
      readingOrder: string[];
      panels: Array<Record<string, unknown>>;
      characterRegions: Array<Record<string, unknown>>;
      speechRegions: Array<Record<string, unknown>>;
      detailRegions: Array<Record<string, unknown>>;
      actionRegions: Array<Record<string, unknown>>;
    };
  };
  acceptedContext: Record<string, unknown>;
};

function parseAnalyzePageRequest(value: unknown): AnalyzePageRequestBody {
  if (!isRecord(value)) {
    throw new Error("AI analysis request must be a JSON object.");
  }

  const image = isRecord(value.image) ? value.image : null;
  const compressedImageDataUrl = value.compressedImageDataUrl;
  const compressedImageWidth = value.compressedImageWidth;
  const compressedImageHeight = value.compressedImageHeight;

  if (!image) {
    throw new Error("AI analysis request is missing image metadata.");
  }

  if (
    typeof compressedImageDataUrl !== "string" ||
    !compressedImageDataUrl.startsWith("data:image/")
  ) {
    throw new Error("AI analysis request is missing a compressed image data URL.");
  }

  if (!isPositiveNumber(compressedImageWidth) || !isPositiveNumber(compressedImageHeight)) {
    throw new Error("AI analysis request is missing compressed image dimensions.");
  }

  return {
    image: {
      fileName: asString(image.fileName, "source image"),
      width: asPositiveNumber(image.width, "source image width"),
      height: asPositiveNumber(image.height, "source image height"),
      mimeType: asString(image.mimeType, "image MIME type"),
    },
    compressedImageDataUrl,
    compressedImageWidth,
    compressedImageHeight,
    cameraShots: Array.isArray(value.cameraShots)
      ? value.cameraShots.filter(isRecord)
      : [],
    focusRegions: Array.isArray(value.focusRegions)
      ? value.focusRegions.filter(isRecord)
      : [],
  };
}

function parseGenerateDirectorSuggestionsRequest(
  value: unknown,
): GenerateDirectorSuggestionsRequestBody {
  if (!isRecord(value)) {
    throw new Error("Director suggestion request must be a JSON object.");
  }

  const pageUnderstanding = isRecord(value.pageUnderstanding)
    ? value.pageUnderstanding
    : null;

  if (!pageUnderstanding) {
    throw new Error("Director suggestion request is missing pageUnderstanding.");
  }

  const analysis = isRecord(pageUnderstanding.analysis)
    ? pageUnderstanding.analysis
    : null;

  if (!analysis) {
    throw new Error(
      "Director suggestions require a usable AI page-understanding analysis.",
    );
  }

  return {
    pageUnderstanding: {
      id: asString(pageUnderstanding.id, "page understanding id"),
      providerModel: typeof pageUnderstanding.providerModel === "string"
        ? pageUnderstanding.providerModel
        : "OpenAI",
      analysis: {
        pageSummary: asString(analysis.pageSummary, "page summary"),
        mood: isRecord(analysis.mood) ? analysis.mood : {},
        readingOrder: Array.isArray(analysis.readingOrder)
          ? analysis.readingOrder.filter((item): item is string => typeof item === "string")
          : [],
        panels: Array.isArray(analysis.panels)
          ? analysis.panels.filter(isRecord)
          : [],
        characterRegions: Array.isArray(analysis.characterRegions)
          ? analysis.characterRegions.filter(isRecord)
          : [],
        speechRegions: Array.isArray(analysis.speechRegions)
          ? analysis.speechRegions.filter(isRecord)
          : [],
        detailRegions: Array.isArray(analysis.detailRegions)
          ? analysis.detailRegions.filter(isRecord)
          : [],
        actionRegions: Array.isArray(analysis.actionRegions)
          ? analysis.actionRegions.filter(isRecord)
          : [],
      },
    },
    acceptedContext: isRecord(value.acceptedContext) ? value.acceptedContext : {},
  };
}

function parseAnalysisJson(outputText: string, responseJson: unknown) {
  if (!outputText.trim()) {
    throw new Error("OpenAI returned an empty analysis response.");
  }

  try {
    return JSON.parse(outputText);
  } catch (error) {
    const incompleteReason = getIncompleteResponseReason(responseJson);
    const reason =
      incompleteReason ??
      (error instanceof Error ? error.message : "Invalid JSON.");

    throw new Error(
      `OpenAI returned incomplete or invalid page-analysis JSON (${outputText.length} chars). ${reason}`,
    );
  }
}

function getIncompleteResponseReason(responseJson: unknown) {
  if (!isRecord(responseJson)) {
    return undefined;
  }

  const status = responseJson.status;
  const incompleteDetails = responseJson.incomplete_details;

  if (status === "incomplete") {
    if (
      isRecord(incompleteDetails) &&
      typeof incompleteDetails.reason === "string"
    ) {
      return `Response status was incomplete: ${incompleteDetails.reason}. Increase max_output_tokens or reduce requested regions.`;
    }

    return "Response status was incomplete. Increase max_output_tokens or reduce requested regions.";
  }

  return undefined;
}

function getOutputText(responseJson: unknown) {
  if (!isRecord(responseJson)) {
    return "";
  }

  if (typeof responseJson.output_text === "string") {
    return responseJson.output_text;
  }

  const output = Array.isArray(responseJson.output) ? responseJson.output : [];

  return output
    .flatMap((item) =>
      isRecord(item) && Array.isArray(item.content) ? item.content : [],
    )
    .map((content: unknown) =>
      isRecord(content) && typeof content.text === "string" ? content.text : "",
    )
    .join("");
}

function getProviderErrorMessage(responseJson: unknown) {
  if (isRecord(responseJson)) {
    const error = responseJson.error;

    if (isRecord(error) && typeof error.message === "string") {
      return `OpenAI provider error: ${error.message}`;
    }
  }

  return "Bad provider response: OpenAI page analysis failed without a readable error message.";
}

function getLocalProxyErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const causeCode = getErrorCauseCode(error);

  if (
    causeCode === "UND_ERR_CONNECT_TIMEOUT" ||
    /timeout/i.test(message)
  ) {
    return [
      "Provider timeout while connecting to OpenAI.",
      "If this network requires V2Ray or another local outbound proxy, add AI_HTTP_PROXY=http://127.0.0.1:10808 to .env.local and restart the Vite dev server.",
      "The OpenAI endpoint is https://api.openai.com/v1/responses.",
    ].join(" ");
  }

  if (message === "fetch failed") {
    return [
      "The local AI proxy could not reach OpenAI.",
      "Check internet access, firewall/proxy/VPN settings, DNS/TLS interception, and whether this dev server process can connect to https://api.openai.com/v1/responses.",
      "If needed, set AI_HTTP_PROXY=http://127.0.0.1:10808 in .env.local and restart the Vite dev server.",
      "The uploaded local image file was already prepared before this network call.",
    ].join(" ");
  }

  return error instanceof Error
    ? error.message
    : "The AI analysis request could not be processed.";
}

function getErrorCauseCode(error: unknown) {
  if (!(error instanceof Error) || !isRecord(error.cause)) {
    return undefined;
  }

  return typeof error.cause.code === "string"
    ? error.cause.code
    : undefined;
}

function createUsageSummary(responseJson: unknown, model: string) {
  if (!isRecord(responseJson) || !isRecord(responseJson.usage)) {
    return undefined;
  }

  const inputTokens = asOptionalNumber(responseJson.usage.input_tokens);
  const outputTokens = asOptionalNumber(responseJson.usage.output_tokens);
  const totalTokens = asOptionalNumber(responseJson.usage.total_tokens);
  const estimatedCostUsd = estimateCostUsd(model, inputTokens, outputTokens);

  return {
    inputTokens,
    outputTokens,
    totalTokens,
    estimatedCostUsd,
  };
}

function estimateCostUsd(
  model: string,
  inputTokens: number | undefined,
  outputTokens: number | undefined,
) {
  if (inputTokens === undefined && outputTokens === undefined) {
    return undefined;
  }

  const normalizedModel = model.toLowerCase();

  if (!normalizedModel.includes("4.1-mini")) {
    return undefined;
  }

  const inputCost = ((inputTokens ?? 0) / 1_000_000) * 0.4;
  const outputCost = ((outputTokens ?? 0) / 1_000_000) * 1.6;

  return Number((inputCost + outputCost).toFixed(6));
}

function readRequestBody(request: LocalRequest, maxBytes: number) {
  return new Promise<string>((resolve, reject) => {
    let totalBytes = 0;
    const chunks: Uint8Array[] = [];

    request.on("data", (chunk: Uint8Array) => {
      totalBytes += chunk.length;

      if (totalBytes > maxBytes) {
        reject(new Error("AI analysis request is too large."));
        request.destroy();
        return;
      }

      chunks.push(chunk);
    });
    request.on("end", () => resolve(decodeChunks(chunks, totalBytes)));
    request.on("error", reject);
  });
}

function concatBytes(chunks: Uint8Array[], totalBytes: number) {
  const body = new Uint8Array(totalBytes);
  let offset = 0;

  chunks.forEach((chunk) => {
    body.set(chunk, offset);
    offset += chunk.length;
  });

  return body;
}

function findByteSequence(
  bytes: Uint8Array,
  sequence: Uint8Array,
  startIndex = 0,
) {
  if (sequence.length === 0) {
    return startIndex;
  }

  for (
    let index = startIndex;
    index <= bytes.length - sequence.length;
    index += 1
  ) {
    if (
      sequence.every(
        (sequenceByte, sequenceIndex) =>
          bytes[index + sequenceIndex] === sequenceByte,
      )
    ) {
      return index;
    }
  }

  return -1;
}

function decodeAscii(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
}

function decodeUtf8(bytes: Uint8Array) {
  return new TextDecoder().decode(bytes);
}

function decodeChunks(chunks: Uint8Array[], totalBytes: number) {
  return decodeUtf8(concatBytes(chunks, totalBytes));
}

function sendJson(response: LocalResponse, statusCode: number, value: unknown) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(value));
}

function asString(value: unknown, label: string) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`AI analysis request is missing ${label}.`);
  }

  return value;
}

function asPositiveNumber(value: unknown, label: string) {
  if (!isPositiveNumber(value)) {
    throw new Error(`AI analysis request is missing ${label}.`);
  }

  return value;
}

function asOptionalNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
