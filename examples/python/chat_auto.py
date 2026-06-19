#!/usr/bin/env python3
"""DEFTLLM example: chat completion with model='auto' (smart routing + failover)."""

from __future__ import annotations

import os
import sys

from openai import OpenAI


def main() -> int:
    base_url = os.getenv("DEFTLLM_BASE_URL", "http://localhost:3001/v1")
    api_key = os.getenv("DEFTLLM_API_KEY")

    if not api_key:
        print(
            "Set DEFTLLM_API_KEY to your unified key from the dashboard (Keys page).\n"
            "Example:\n"
            "  set DEFTLLM_API_KEY=deftllm-...\n"
            "  python examples/python/chat_auto.py",
            file=sys.stderr,
        )
        return 1

    client = OpenAI(base_url=base_url, api_key=api_key)

    prompt = os.getenv("DEFTLLM_PROMPT", "Say hello in exactly three words.")
    print(f"Base URL: {base_url}")
    print(f"Model: auto\nPrompt: {prompt!r}\n")

    resp = client.chat.completions.create(
        model="auto",
        messages=[{"role": "user", "content": prompt}],
    )

    message = resp.choices[0].message.content or ""
    print("Response:", message)
    print("Routed model:", resp.model)
    if getattr(resp, "usage", None):
        print("Tokens:", resp.usage.total_tokens)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
