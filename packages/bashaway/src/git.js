import exec from "@sliit-foss/actions-exec-wrapper";
import axios from "axios";

export const commitList = async (urlOrPath) => {
  if (urlOrPath?.includes("https://")) {
    await exec(`git clone ${urlOrPath} out`);
    process.chdir("out");
  } else {
    process.chdir(urlOrPath);
  }
  const commits = await exec(`git log --pretty=format:"%h (%cd) %s|||%cn|||%ce|||%an|||%ae" --date=iso`);
  return commits
    ?.split("\n")
    ?.filter((c) => c)
    ?.map((commit) => {
      const [, date, time, offset, ...info] = commit?.split(" ");
      const [message, commiterName, commiterEmail, authorName, authorEmail] = info?.join(" ")?.split("|||");
      return {
        message,
        timestamp: new Date(`${date.replace("(", "")} ${time} ${offset.replace(")", "")}`).getTime(),
        commiterName,
        commiterEmail,
        authorName,
        authorEmail
      };
    });
};

export const ghOrgRepos = async (org) => {
  return axios.get(`https://api.github.com/orgs/${org}/repos?per_page=1000`).then((res) => res.data);
};
