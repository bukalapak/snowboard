#!/bin/bash

TEMPLATES=('alpha');

for template in $TEMPLATES; do
  output_dir="$3/${template}"
  mkdir -p "${output_dir}"

  for example in ${2}/*.md; do
    fname="${example##*/}"
    fname_html="${fname/md/html}"

    if [ "${fname}" == "README.md" ]; then
      continue
    fi

    echo "Generating ${fname}..."
    "$1" -i "${example}" -t "${template}" -o "${output_dir}/${fname_html}"
    echo "Done!"
  done
done
