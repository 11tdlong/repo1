#!/bin/bash

# Check if a symbol was provided
if [ -z "$1" ]; then
  echo "Usage: $0 <STOCK_SYMBOL>"
  exit 1
fi

symbol="$1"
json=$(curl -s "https://iboard-query.ssi.com.vn/stock/${symbol}?boardId=MAIN")

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
    printf "%-10s %-10s  %-10s %-10s\n", b, bv, o, ov
  }
}
'
