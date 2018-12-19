# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.0] - 2018-12-19

### Changed

- Modified bare import statements will now include version number as listed in local `package.json`
  - Will be ommited if not found, which will result in `latest`
