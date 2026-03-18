# Default Environment Variables – Render Docs

> Source: https://render.com/docs/environment-variables
> Cached: 2026-03-18T10:03:36.688Z

---

# Default Environment Variables

Render automatically sets the values of certain environment variables for your service.

Unless otherwise noted, these environment variables are available at both build time and runtime.

**Environment variable values are always strings.**

In your application logic, perform any necessary conversions for variable values that represent other data types, such as `"false"` or `"10000"`.

## [](#by-runtime)By runtime

### [](#all-runtimes)All runtimes

###### [](#is-pull-request)`IS_PULL_REQUEST`

This value is `true` for [pull request previews](/docs/service-previews) and `false` otherwise.

Note that these are the *string* values `"true"` and `"false"`. Convert to booleans as needed.

###### [](#render)`RENDER`

This value is always `true`. Your code can check this value to detect whether it&#x27;s running on Render.

###### [](#render-cpu-count)`RENDER_CPU_COUNT`

The number of CPUs available for this service, based on its [instance type](/pricing#services).

For example, this value is `0.5` for the Starter instance type and `2` for the Pro instance type. Note that these are the *string* values `"0.5"` and `"2"`. Convert to numbers as needed.

###### [](#render-discovery-service)`RENDER_DISCOVERY_SERVICE`

The Render DNS name used to discover all running instances of a [scaled service](/docs/scaling). Has the format `$RENDER_SERVICE_NAME-discovery`.

###### [](#render-external-hostname)`RENDER_EXTERNAL_HOSTNAME`

For a web service or static site, this is the service&#x27;s `onrender.com` hostname (such as `myapp.onrender.com`).

For other service types, this value is empty.

###### [](#render-external-url)`RENDER_EXTERNAL_URL`

For a web service or static site, this is the service&#x27;s full `onrender.com` URL (such as `https://myapp.onrender.com`).

For other service types, this value is empty.

###### [](#render-git-branch)`RENDER_GIT_BRANCH`

The Git branch for a service or deploy.

###### [](#render-git-commit)`RENDER_GIT_COMMIT`

The commit SHA for a service or deploy.

###### [](#render-git-repo-slug)`RENDER_GIT_REPO_SLUG`

Has the format `$username/$reponame`.

###### [](#render-instance-id)`RENDER_INSTANCE_ID`

The unique identifier of the current service instance. Useful for [scaled services](/docs/scaling) with multiple instances.

###### [](#render-service-id)`RENDER_SERVICE_ID`

The service&#x27;s unique identifier. Used in the [Render API](/docs/api).

###### [](#render-service-name)`RENDER_SERVICE_NAME`

A unique, human-readable identifier for a service.

###### [](#render-service-type)`RENDER_SERVICE_TYPE`

The current service&#x27;s [type](/docs/service-types). One of `web`, `pserv`, `cron`, `worker`, `static`.

###### [](#render-web-concurrency)`RENDER_WEB_CONCURRENCY`

For a web service or private service, this is the recommended number of concurrent web processes for handling requests. This is based on the number of CPUs available on the service&#x27;s [instance type](/pricing#services).

For example, this value is `1` for the Starter instance type and `2` for the Pro instance type. Note that these are the *string* values `"1"` and `"2"`. Convert to numbers as needed.

This is only available at runtime. At build time or for other service types, this value is empty.

###### [](#web-concurrency)`WEB_CONCURRENCY`

For a web service or private service created after December 8th 2025, this defaults to the recommended number of concurrent web processes for handling requests. This is based on the number of CPUs available on the service&#x27;s [instance type](/pricing#services).

For example, this value is `1` for the Starter instance type and `2` for the Pro instance type. Note that these are the *string* values `"1"` and `"2"`. Convert to numbers as needed.

This is only available at runtime. At build time, for other service types, or for web and private services created before the cutoff date, this value is empty.

**Other environment variables starting with `RENDER_` might be present in your build and runtime environments.**

However, variables not listed above are strictly for internal use and might change without warning.

### [](#docker)Docker

Render does not provide additional environment variables on top of what&#x27;s listed under [All runtimes](#all-runtimes).

### [](#elixir)Elixir

###### [](#mix-env)`MIX_ENV`

`prod`

###### [](#release-distribution)`RELEASE_DISTRIBUTION`

`name`

### [](#go)Go

###### [](#go111module)`GO111MODULE`

`on`

###### [](#gopath)`GOPATH`

`/opt/render/project/go`

### [](#nodejs)Node.js

###### [](#node-env)`NODE_ENV`

`production` (runtime only)

###### [](#node-modules-cache)`NODE_MODULES_CACHE`

`true`

### [](#python-3)Python 3

###### [](#ci)`CI`

`true` (build time only)

###### [](#forwarded-allow-ips)`FORWARDED_ALLOW_IPS`

`*`

###### [](#gunicorn-cmd-args)`GUNICORN_CMD_ARGS`

`--preload --access-logfile - --bind=0.0.0.0:10000`

###### [](#pipenv-yes)`PIPENV_YES`

`true`

###### [](#venv-root)`VENV_ROOT`

`/opt/render/project/src/.venv`

### [](#ruby)Ruby

###### [](#bundle-app-config)`BUNDLE_APP_CONFIG`

`/opt/render/project/.gems`

###### [](#bundle-bin)`BUNDLE_BIN`

`/opt/render/project/.gems/bin`

###### [](#bundle-deployment)`BUNDLE_DEPLOYMENT`

`true`

###### [](#bundle-path)`BUNDLE_PATH`

`/opt/render/project/.gems`

###### [](#gem-path)`GEM_PATH`

`/opt/render/project/.gems`

###### [](#malloc-arena-max)`MALLOC_ARENA_MAX`

`2`

###### [](#passenger-engine)`PASSENGER_ENGINE`

`builtin`

###### [](#passenger-environment)`PASSENGER_ENVIRONMENT`

`production`

###### [](#passenger-port)`PASSENGER_PORT`

`10000`

###### [](#pidfile)`PIDFILE`

`/tmp/puma-server.pid`

###### [](#rails-env)`RAILS_ENV`

`production`

###### [](#rails-serve-static-files)`RAILS_SERVE_STATIC_FILES`

`true`

###### [](#rails-log-to-stdout)`RAILS_LOG_TO_STDOUT`

`true`

### [](#rust)Rust

###### [](#cargo-home)`CARGO_HOME`

`/opt/render/project/.cargo`

###### [](#rocket-env)`ROCKET_ENV`

`prod`

###### [](#rocket-port)`ROCKET_PORT`

`10000` (runtime only)

###### [](#rustup-home)`RUSTUP_HOME`

`/opt/render/project/.rustup`

## [](#optional-environment-variables)Optional environment variables

You can set these environment variables to modify the default behavior for your services.

### [](#all-runtimes-1)All runtimes

###### [](#port)`PORT`

For [web services](/docs/web-services), specify the port that your HTTP server binds to.

The default port is `10000`.

### [](#elixir-1)Elixir

###### [](#elixir-version)`ELIXIR_VERSION`

See [Setting Your Elixir and Erlang Versions](/docs/elixir-erlang-versions).

###### [](#erlang-version)`ERLANG_VERSION`

See [Setting Your Elixir and Erlang Versions](/docs/elixir-erlang-versions).

### [](#nodejs-1)Node.js

###### [](#skip-install-deps)`SKIP_INSTALL_DEPS`

Set this to `true` to skip running `yarn`/`npm install` during build.

###### [](#node-version)`NODE_VERSION`

See [Setting Your Node.js Version](/docs/node-version).

###### [](#bun-version)`BUN_VERSION`

See [Setting Your Bun Version](/docs/bun-version).

### [](#python-3-1)Python 3

###### [](#python-version)`PYTHON_VERSION`

See [Setting Your Python Version](/docs/python-version).

###### [](#poetry-version)`POETRY_VERSION`

See [Setting Your Poetry Version](/docs/poetry-version).

###### [](#uv-version)`UV_VERSION`

See [Setting Your uv Version](/docs/uv-version).

### [](#rust-1)Rust

###### [](#rustup-toolchain)`RUSTUP_TOOLCHAIN`

See [Specifying a Rust Toolchain](/docs/rust-toolchain).

## [](#how-to-set-environment-variables)How to set environment variables

See [Environment Variables and Secrets](/docs/configure-environment-variables).