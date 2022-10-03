import { TheRoundContext } from "./theRoundContext";

const baseUrl = "https://testnet-the-rounf.herokuapp.com"; //"http://localhost:3000"; // TODO add your baseUrl

export type ErrorWrapper<TError> =
  | TError
  | { status: "unknown"; payload: string };

export type TheRoundFetcherOptions<TBody, THeaders, TQueryParams, TPathParams> =
  {
    url: string;
    method: string;
    body?: TBody;
    headers?: THeaders;
    queryParams?: TQueryParams;
    pathParams?: TPathParams;
  } & TheRoundContext["fetcherOptions"];

export async function theRoundFetch<
  TData,
  TError,
  TBody extends {} | undefined | null,
  THeaders extends {},
  TQueryParams extends {},
  TPathParams extends {}
>({
  url,
  method,
  body,
  headers,
  pathParams,
  queryParams,
}: TheRoundFetcherOptions<
  TBody,
  THeaders,
  TQueryParams,
  TPathParams
>): Promise<TData> {
  try {
    const token = localStorage.getItem("token");

    let newHeaders = {
      "Content-Type": "application/json",
      ...headers,
    };

    if (
      !newHeaders.hasOwnProperty("authorization") &&
      !newHeaders.hasOwnProperty("Authorization")
    ) {
      (newHeaders as any)["authorization"] = token ? `Bearer ${token}` : "";
    }

    const response = await window.fetch(
      `${baseUrl}${resolveUrl(url, queryParams, pathParams)}`,
      {
        method: method.toUpperCase(),
        body: body ? JSON.stringify(body) : undefined,
        headers: newHeaders,
      }
    );
    if (!response.ok) {
      let error: ErrorWrapper<TError>;
      try {
        error = await response.json();
      } catch (e) {
        error = {
          status: "unknown" as const,
          payload:
            e instanceof Error
              ? `Unexpected error (${e.message})`
              : "Unexpected error",
        };
      }

      throw error;
    }

    return await response.json();
  } catch (e) {
    throw {
      status: "unknown" as const,
      payload:
        e instanceof Error ? `Network error (${e.message})` : "Network error",
    };
  }
}

const resolveUrl = (
  url: string,
  queryParams: Record<string, string> = {},
  pathParams: Record<string, string> = {}
) => {
  let query = new URLSearchParams(queryParams).toString();
  if (query) query = `?${query}`;
  return url.replace(/\{\w*\}/g, (key) => pathParams[key.slice(1, -1)]) + query;
};
