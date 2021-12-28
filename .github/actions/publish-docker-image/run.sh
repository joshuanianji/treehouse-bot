SERVICE="$1" # the name of the service
REPO_TOKEN="$2"

echo "SERVICE=${SERVICE}"
echo "VERSION=${GITHUB_SHA}"

echo ${REPO_TOKEN} | docker login ghcr.io -u ${GITHUB_REF} --password-stdin

docker-compose build ${SERVICE}

# Push the Github SHA tag to GHCR 

# The format is: ghcr.io/joshuanianji/treehouse-bot.server:${GITHUB_SHA}
docker tag ${SERVICE} ghcr.io/${GITHUB_REPOSITORY}.${SERVICE}:${GITHUB_SHA}
docker push $TAG

# Push the latest tag to GHCR
docker tag ${SERVICE} ghcr.io/${GITHUB_REPOSITORY}.${SERVICE}:latest
docker push $TAG
