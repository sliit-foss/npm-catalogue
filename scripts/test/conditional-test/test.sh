# This script is used to conditionally execute unit tests only if the required environment variables for it are present.
# The reason for this is to prevent the execution of such tests from breaking an entire test workflow triggered through a repository fork's pull request.
# Pull requests originating from forks do not have access to GitHub Secrets thus these keys will not be set

dotenv -- sh ../../scripts/test/conditional-test/evaluator.sh $1 $2 $3 $4 $5 $6 $7 $8 $9 ${10} ${11} ${12} ${13} ${14} ${15} ${16} ${17} ${18} ${19} ${20}