#!/bin/sh

# Fast-forward all branches that are tracking branches

curbranch=$(git rev-parse --abbrev-ref HEAD)

for branch in $(git for-each-ref refs/heads --format="%(refname:short)"); do
        upbranch=$(git config --get branch.$branch.merge | sed 's:refs/heads/::');
        if [ "$branch" = "$upbranch" ]; then
                if [ "$branch" = "$curbranch" ]; then
                        echo Fast forwarding current branch $curbranch
                        git merge --ff-only origin/$upbranch
                else
                        echo Fast forwarding $branch with origin/$upbranch
                        git fetch . origin/$upbranch:$branch
                fi
        fi
done;