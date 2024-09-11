#!/bin/bash

# region Dependencies
# Check for jq and install it if not present
if ! command -v jq &> /dev/null
then
    echo "jq could not be found, attempting to install..."

    if ! command -v brew &> /dev/null
    then
        echo "Homebrew not found. Please install Homebrew and try again."
        exit 1
    fi

    brew install jq
fi

# Ensure 'node-semver' is installed or install it
if ! command -v semver &> /dev/null; then
    echo "semver tool not found, attempting to install..."
    npm install -g semver
fi
# endregion

# region Functions
# Function to compare versions
compare_versions() {
    if [[ $1 == $2 ]]
    then
        return 0
    fi
    local IFS=.
    local i ver1=($1) ver2=($2)
    for ((i=${#ver1[@]}; i<${#ver2[@]}; i++))
    do
        ver1[i]=0
    done
    for ((i=0; i<${#ver1[@]}; i++))
    do
        if [[ -z ${ver2[i]} ]]
        then
            ver2[i]=0
        fi
        if ((10#${ver1[i]} > 10#${ver2[i]}))
        then
            return 1
        fi
        if ((10#${ver1[i]} < 10#${ver2[i]}))
        then
            return 2
        fi
    done
    return 0
}

# Function to check version against a range or single value
check_version_against_requirement() {
    local version=$1
    local requirement=$2

    # Check if the version satisfies the requirement
    if semver -r "$requirement" "$version" &> /dev/null; then
        return 0 # Version is compatible
    else
        return 1 # Version does not meet the requirement
    fi
}

check_and_echo_version_requirement() {
    local package_name=$1
    local current_version=$2
    local required_version=$3

    if ! check_version_against_requirement "$current_version" "$required_version"; then
        echo "Your $package_name version ($current_version) does not meet the requirement ($required_version)."
        exit 1
    else
        echo "$package_name version ($current_version) meets the requirement ($required_version)."
    fi
}
# endregion

# Check Node version
node_version_required=$(jq -r '.engines.node // empty' package.json) # Extract version requirements from package.json
current_node_version=$(node -v | sed 's/v//') # Get current versions
check_and_echo_version_requirement "Node" "$current_node_version" "$node_version_required"
