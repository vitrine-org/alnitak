IMAGE = vitrine-alnitak
VERSION = 1.0.0

.PHONY: install build

install:
	docker build -t $(IMAGE) .
	docker run --rm -v $(PWD):/app $(IMAGE) sh -c "npm install && chown -R $(shell id -u):$(shell id -g) /app/node_modules /app/package-lock.json"

build:
	docker build -t $(IMAGE) .
	docker run --rm -v $(PWD):/app $(IMAGE) sh -c "\
		npm run build && \
		cp theme.json settings.definitions.json settings.json dist/ && \
		cd dist && zip ../vitrine-alnitak-$(VERSION).zip * && \
		chown -R $(shell id -u):$(shell id -g) /app/dist /app/vitrine-alnitak-$(VERSION).zip"
