#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
output_root="${project_dir}/steam-upload"
output_dir="${output_root}/weighted-yield-scores"
staging_root="$(mktemp -d)"
staging_dir="${staging_root}/weighted-yield-scores"

cleanup() {
  rm -rf -- "${staging_root}"
}
trap cleanup EXIT

mkdir -p "${staging_dir}" "${output_root}"

for item in \
  LICENSE \
  weighted-yield-scores.modinfo \
  text \
  ui \
  ui-next
do
  cp -R "${project_dir}/${item}" "${staging_dir}/"
done

rm -rf -- "${output_dir}"
mv "${staging_dir}" "${output_dir}"

echo "${output_dir}"
