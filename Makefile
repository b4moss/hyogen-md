APP_DIR := app
DOCS_DIR := docs-site
NPM := npm --prefix $(APP_DIR)
NPM_DOCS := npm --prefix $(DOCS_DIR)

SHELL := /bin/bash
.DEFAULT_GOAL := help

.PHONY: help install install-docs install-all \
	build typecheck test test-watch test-pg test-all \
	dev dev-docs clean clean-docs clean-all \
	pack size check build-docs check-docs \
	ruleset-help ruleset-create ruleset-apply ruleset-check

help: ## Show available targets
	@printf "Usage: make [target]\n\nTargets:\n"
	@grep -E '^[a-zA-Z0-9_.-]+:.*##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "}; {printf "  %-14s %s\n", $$1, $$2}'

install: ## Install app/ dependencies
	$(NPM) install

install-docs: ## Install docs-site/ dependencies
	$(NPM_DOCS) install

install-all: install install-docs ## Install app + docs-site dependencies

build: ## Build library into app/dist (minified)
	$(NPM) run build

typecheck: ## Typecheck app/
	$(NPM) run typecheck

test: ## Run app/ Vitest once
	$(NPM) run test

test-watch: ## Run app/ Vitest in watch mode
	$(NPM) run test:watch

test-pg: ## Run docs-site Playground Vitest once
	$(NPM_DOCS) run test

test-all: test test-pg ## Run app + Playground tests

dev: ## Watch-build app/ library
	$(NPM) run dev

dev-docs: ## Start docs-site Nuxt dev server
	$(NPM_DOCS) run dev

build-docs: ## Generate static docs-site into docs-site/.output/public
	$(NPM_DOCS) run generate

clean: ## Remove app/dist (keeps node_modules)
	rm -rf $(APP_DIR)/dist

clean-docs: ## Remove docs-site build outputs
	rm -rf $(DOCS_DIR)/.output $(DOCS_DIR)/.nuxt $(DOCS_DIR)/.nitro $(DOCS_DIR)/.cache $(DOCS_DIR)/dist

clean-all: clean clean-docs ## Remove build outputs
	rm -rf $(APP_DIR)/coverage

pack: build ## npm pack --dry-run (shows tarball contents/size)
	@cd $(APP_DIR) && $(NPM) pack --dry-run

size: build ## Report dist JS / gzip / npm pack sizes
	@node scripts/report-size.mjs

check: typecheck build test pack ## Pre-publish: typecheck + build + test + pack dry-run
	@echo "check OK"

check-docs: build-docs ## Verify docs-site static generation
	@echo "check-docs OK"

# GitHub repository ruleset helpers.
# Real work lives in scripts/; this Makefile is a thin wrapper.
# Target/variable names are prefixed with ruleset- / RULESET_ so this
# file can be vendored via git subtree without colliding with host Makefiles.

RULESET_ROOT_DIR := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
RULESET_SCRIPTS := $(RULESET_ROOT_DIR)/scripts

RULESET_REPO ?=
RULESET_BRANCH ?= main
RULESET_VISIBILITY ?= public
RULESET_CREATE_FLAGS ?=

ruleset-help: ## Show ruleset helper usage
	@printf '%s\n' \
		'Targets:' \
		'' \
		'  make ruleset-create RULESET_REPO=OWNER/NAME [RULESET_VISIBILITY=public] [RULESET_CREATE_FLAGS="--clone"]' \
		'      Create a GitHub repo and apply rulesets.' \
		'' \
		'  make ruleset-apply RULESET_REPO=OWNER/NAME' \
		'      Apply/update rulesets on an existing repo.' \
		'' \
		'  make ruleset-check RULESET_REPO=OWNER/NAME [RULESET_BRANCH=main]' \
		'      List rulesets and check which rules apply to RULESET_BRANCH.' \
		'' \
		'Notes:' \
		'  - GitHub Free (org): rulesets work on public repos only.' \
		'  - Requires gh (repo admin) and jq.' \
		'  - Namespaced as ruleset-* / RULESET_* for subtree-safe includes.'

ruleset-create: ## Create a GitHub repo and apply rulesets
	@if [[ -z "$(RULESET_REPO)" ]]; then \
		echo "error: RULESET_REPO=OWNER/NAME is required" >&2; \
		echo "example: make ruleset-create RULESET_REPO=my-org/new-app" >&2; \
		exit 1; \
	fi
	@$(RULESET_SCRIPTS)/create-repo-with-rulesets.sh "$(RULESET_REPO)" "--$(RULESET_VISIBILITY)" $(RULESET_CREATE_FLAGS)

ruleset-apply: ## Apply/update rulesets on an existing repo
	@if [[ -z "$(RULESET_REPO)" ]]; then \
		echo "error: RULESET_REPO=OWNER/NAME is required" >&2; \
		echo "example: make ruleset-apply RULESET_REPO=my-org/existing-app" >&2; \
		exit 1; \
	fi
	@$(RULESET_SCRIPTS)/apply-rulesets.sh --repo "$(RULESET_REPO)"

ruleset-check: ## List rulesets and check branch applicability
	@if [[ -z "$(RULESET_REPO)" ]]; then \
		echo "error: RULESET_REPO=OWNER/NAME is required" >&2; \
		echo "example: make ruleset-check RULESET_REPO=my-org/existing-app RULESET_BRANCH=main" >&2; \
		exit 1; \
	fi
	@echo "== ruleset list =="
	@gh ruleset list -R "$(RULESET_REPO)"
	@echo
	@echo "== ruleset check $(RULESET_BRANCH) =="
	@gh ruleset check "$(RULESET_BRANCH)" -R "$(RULESET_REPO)"
