const simpleGit = require("simple-git");
const git = simpleGit();

const WHITELIST = ["main", "dev"];

(async () => {
  const inquirer = await import("inquirer");

  // remove all remote unexist branches
  await git.raw(["remote", "prune", "origin"]);
  console.log("Pruned remote branches.");

  // all local branches
  const localBranches = await git.branchLocal();
  // current branch
  const currentBranch = localBranches.current;

  const answers = await inquirer.default.prompt([
    {
      type: "checkbox",
      name: "branches",
      message: "Select the branch you want to keep",
      choices: localBranches.all,
    },
  ]);

  const storeBranches = answers.branches;

  // remove all local branches except the selected ones
  for (const branch of localBranches.all) {
    if (
      !storeBranches.includes(branch) &&
      !WHITELIST.includes(branch) &&
      branch !== currentBranch
    ) {
      try {
        await git.branch(["-D", branch]);
        console.log(`Deleted local branch: ${branch}`);
      } catch (e) {
        console.log(`Failed to delete local branch: ${branch}`);
        console.log(e);
      }
    }
  }

  console.log("Cleaned up local branches.");
})();
