if [ "$TAG" = "latest" ]; then
  ignore=ci
fi

npx automatic-versioning --skip-commit --recursive --prerelease-tag=blizzard --prerelease-branch=development --ignore-prefixes=$ignore  $1