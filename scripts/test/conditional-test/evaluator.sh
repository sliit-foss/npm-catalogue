# parse keys

while getopts k: flag
do
    case "${flag}" in
        k) keys=${OPTARG};;
    esac
done

# check if all keys are present

check=true

while IFS=';' read -ra ADDR; do
  for i in "${ADDR[@]}"; do
    if [ -z ${!i} ]; then
        check=false
        break
    fi
  done
done <<< "$keys"

if [ $check == true ]; then
    bash ../../scripts/test/test.sh
else 
    echo "skipped as the required environment variables are not present"
fi