<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# perplexity comet token usage

Perplexity Comet uses the same underlying token system as Perplexity Search and Labs: every request consumes tokens based on the length of your input, the context pulled in (e.g., page content, history, emails), and the length of the AI’s response, but there is no separate “Comet-only” token meter you need to manage.[^1_1][^1_2]

## How tokens work

A token is a small chunk of text (part of a word, a whole word, or punctuation) that models use to read and generate language.  Perplexity can typically process around 8,000 tokens of text directly in a single query before it switches to treating the content as a file-style input.[^1_2][^1_1]

## Comet-specific behavior

- Comet itself does not introduce a different billing model; it is a browser that surfaces Perplexity’s AI and search, so token usage comes from the Perplexity side (Search, Labs, Research) that Comet calls under the hood.[^1_3][^1_4]
- When Comet uses “Ask”/“Summarize”/Comet Intelligence on a page or your history, the retrieved page text or history snippets are part of the tokens counted for that request.[^1_1][^1_3]


## Impact of your Pro subscription

- As a Perplexity Pro user, you get practically unlimited Pro searches and high token allowances per day in the main product, which extend to the Comet Assistant because it is just another way of calling those same features.[^1_4][^1_5]
- You also get higher limits for large inputs via file-style handling when needed, which helps when Comet is summarizing long pages or dense content.[^1_5][^1_1]


## Practical usage tips in Comet

- Very long pages or threads: If you see truncation, break the task into smaller questions so each call stays within the 8k-token active window.[^1_1]
- Heavy multi-step work: For multi-page or multi-document projects, consider triggering Deep Research or Labs from Perplexity directly, then use Comet mainly to navigate and review results.[^1_6][^1_5]

If you tell what you want to optimize (e.g., “minimize tokens while coding / reading papers in Comet”), a more tailored workflow can be outlined.
<span style="display:none">[^1_10][^1_7][^1_8][^1_9]</span>

<div align="center">⁂</div>

[^1_1]: https://www.perplexity.ai/help-center/en/articles/10354924-about-tokens

[^1_2]: https://www.perplexity.ai/help-center/en/articles/10354919-what-advanced-ai-models-are-included-in-my-subscription

[^1_3]: https://www.perplexity.ai/help-center/en/articles/11172798-getting-started-with-comet

[^1_4]: https://www.perplexity.ai/help-center/en/articles/11187416-which-perplexity-subscription-plan-is-right-for-you

[^1_5]: https://www.perplexity.ai/help-center/en/articles/10352901-what-is-perplexity-pro

[^1_6]: https://www.perplexity.ai/hub/blog/introducing-perplexity-deep-research

[^1_7]: https://www.perplexity.ai/hub/blog/introducing-comet-plus

[^1_8]: https://www.perplexity.ai/help-center/en/articles/10354847-api-payment-and-billing

[^1_9]: https://www.perplexity.ai/help-center/en/articles/10352995-api-settings

[^1_10]: https://www.perplexity.ai/hub/blog/introducing-perplexity-max

