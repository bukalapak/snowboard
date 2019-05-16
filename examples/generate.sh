#!/bin/bash

TEMPLATES=('alpha');

git submodules update --init

for template in $TEMPLATES; do
  output_dir="$2/${template}"
  mkdir -p "${output_dir}"

  for example in ${1}/*.md; do
    fname="${example##*/}"
    fname_html="${fname/md/html}"

    if [ "${fname}" == "README.md" ]; then
      continue
    fi

    echo "Generating ${fname}..."
    node lib/main.js html -o "${output_dir}/${fname_html}" "${example}"
    echo "Done!"
  done
done
