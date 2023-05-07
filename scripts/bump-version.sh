if [ "$TAG" = "latest" ]; then
  ignore=ci
fi

pnpm exec automatic-versioning --no-commit --recursive --prerelease-tag=blizzard --prerelease-branch=development --ignore-prefixes=$ignore  $1