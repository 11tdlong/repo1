#!/bin/bash

# Check if a symbol was provided
if [ -z "$1" ]; then
  echo "Usage: $0 <STOCK_SYMBOL>"
  exit 1
fi

symbol="$1"
url="https://iboard-query.ssi.com.vn/stock/${symbol}?boardId=MAIN"

# Fetch JSON with browser-like headers
json=$(curl -s "$url" \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)" \
  -H "Accept: application/json, text/plain, */*" \
  -H "Accept-Language: en-US,en;q=0.9" \
  -H "Connection: keep-alive" \
  -H "Referer: https://iboard.ssi.com.vn/" \
  --compressed)


# Exit if empty response or HTML fallback
if [[ -z "$json" || "$json" == "<!DOCTYPE html>"* ]]; then
  echo "⚠️ SSI API returned HTML or empty response — likely blocked by Cloudflare"
  exit 1
fi

# Parse and format output
echo "$json" | awk '
BEGIN {
  FS="[:,{}\"]+"
}
{
  for (i = 1; i <= NF; i++) {
    if ($i ~ /^best[0-9]+Bid$/) {
      level = substr($i, 5, length($i)-7)
      bid[level] = $(i+1)
    }
    if ($i ~ /^best[0-9]+BidVol$/) {
      level = substr($i, 5, length($i)-10)
      bidVol[level] = $(i+1)
    }
    if ($i ~ /^best[0-9]+Offer$/) {
      level = substr($i, 5, length($i)-9)
      offer[level] = $(i+1)
    }
    if ($i ~ /^best[0-9]+OfferVol$/) {
      level = substr($i, 5, length($i)-12)
      offerVol[level] = $(i+1)
    }
  }
}
END {
  for (i = 1; i <= 10; i++) {
    b = (i in bid) ? bid[i] : "—"
    bv = (i in bidVol) ? bidVol[i] : "—"
    o = (i in offer) ? offer[i] : "—"
    ov = (i in offerVol) ? offerVol[i] : "—"
    printf "%-10s%-10s %-10s%-10s\n", b, bv, o, ov
  }
}
'
