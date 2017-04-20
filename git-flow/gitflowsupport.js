var graphConfig = new GitGraph.Template({
    branch: {
        color: "#000000",
        lineWidth: 3,
        spacingX: 60,
        mergeStyle: "straight",
        showLabel: true,                // display branch names on graph
        labelFont: "normal 10pt Arial",
        labelRotation: 0
    },
    commit: {
        spacingY: -30,
        dot: {
            size: 8,
            strokeColor: "#000000",
            strokeWidth: 4
        },
        tag: {
            font: "normal 10pt Arial",
            color: "yellow"
        },
        message: {
            color: "black",
            font: "normal 12pt Arial",
            displayAuthor: false,
            displayBranch: false,
            displayHash: false,
        }
    },
    arrow: {
        size: 8,
        offset: 3
    }
});

var config = {
  template: graphConfig,
  //mode: "extended",
  orientation: "horizontal"
};

var bugfixCommit = {
  messageAuthorDisplay:false,
  messageBranchDisplay:false,
  messageHashDisplay:false,
  message:"Bug fix commit(s)"
};

var stablizationCommit = {
  messageAuthorDisplay:false,
  messageBranchDisplay:false,
  messageHashDisplay:false,
  message:"Release stablization commit(s)"
};

// You can manually fix columns to control the display.
var develop_2xx_col = 2;
var release_200_col = 1;
var v20x_col = 0;
var featureCol1 = 3;
var featureCol2 = 4;
var developCol = 5;
var releaseCol = 6;
var ver10xCol = 7;
var supportCol = 8;
var ver11xCol = 9;

var gitgraph = new GitGraph(config);

var doStuffButton = document.getElementById("doStuff");
var description = document.getElementById("description");

var master = gitgraph.branch({name:"master", column:developCol});
master.commit("Initial commit");
var develop = gitgraph.branch({parentBranch:master, name:"develop", column:developCol});
develop.commit();
var feature1;
var feature2;

function startTwoFeatures() {
    feature1 = gitgraph.branch({parentBranch:develop, name:"feature/1", column:featureCol1});
    feature1.commit("A feature to go into v1.0.0").commit({messageDisplay:false});
    develop.commit();
    feature2 = gitgraph.branch({parentBranch:develop, name:"feature/2", column:featureCol2});
    feature2.commit("Another feature to go into v1.0.0").commit({messageDisplay:false});
    feature2.merge(develop);
    develop.merge(feature1);
    feature1.commit();
    feature1.merge(develop);
    doStuffButton.onclick = startReleaseBranch100;
    description.innerHTML = "Normal feature workflow. Notice how feature 1 is kept up-to-date with develop.";
}
doStuffButton.onclick = startTwoFeatures;

var release_100;
function startReleaseBranch100() {
    release_100 = gitgraph.branch({parentBranch: develop, name: "rc/v1.0.0", column:releaseCol});
    release_100.commit({message:"Start v1.0.0-rc Release Candidate builds"});
    doStuffButton.onclick = developDuring100rc;
    description.innerHTML = "Take \"snapshot\" of current develop branch state, start QA on it";
}

var feature3 = gitgraph.branch({parentBranch:develop, name:"feature/3", column:featureCol2});
var develop_2xx_branch;
function developDuring100rc() {
    develop.commit({messageDisplay:false});
    develop_2xx_branch = gitgraph.branch({parentBranch: develop, name: "develop_v2", column:develop_2xx_col});
    doStuffButton.onclick = stabilizeRc100;
    description.innerHTML = "Developers can continue work normally, the release branch should only concern QA and release managers (unless there are bugs)";
}

function stabilizeRc100() {
    release_100.commit(stablizationCommit);
    doStuffButton.onclick = releaseRc100;
    description.innerHTML = "If there ARE bugs, developers fix them on the RC branch. The fixes will be merged back to develop.";
}

var v10x_branch;
function releaseRc100() {
    v10x_branch = gitgraph.branch({parentBranch:release_100, name:"v1.0.x", column:ver10xCol});
    v10x_branch.commit({message: "Official 1.0.0 release", tag: "1.0.0", dotStrokeWidth: 10});
    v10x_branch.merge(develop);
    doStuffButton.onclick = developFor200InParallel;
    description.innerHTML = "Once the RC branch passes QA, the release manager bumps the official version number, creates a new branch for v1.0.x, tags the commit, and merges back to develop.";
}

function developFor200InParallel() {
    develop_2xx_branch.commit();
    develop_2xx_branch.commit();
    doStuffButton.onclick = developAndRelease110;
    description.innerHTML = "At this point, an adventurous developer (probably Roman) starts a huge feature which will only enter v2.0.0 of the product. " +
        "All features for v2 will continue, in parallel, in this same flow (with feature branches, etc.)";
}

var v11x_branch;
var release_110;
function developAndRelease110() {
    develop.commit();
    develop.commit();
    release_110 = gitgraph.branch({parentBranch: develop, name: "rc/v1.1.0", column:releaseCol});
    release_110.commit({message: "Bump version from 1.0.0 to 1.1.0"});
    v11x_branch = gitgraph.branch({parentBranch:release_110, name:"v1.1.x", column:ver11xCol});
    v11x_branch.commit({message: "Official 1.1.0 release", tag: "1.1.0", dotStrokeWidth: 10});
    v11x_branch.merge(develop);
    doStuffButton.onclick = bugfixOn100;
    description.innerHTML = "A new minor version is released, v1.1.0";
}

var v100_support_branch;
function bugfixOn100() {
    v100_support_branch = gitgraph.branch({parentBranch:v10x_branch, name:"v1.0.0_HF1", column:supportCol});
    v100_support_branch.commit();
    doStuffButton.onclick = finishBugfixOn100;
    description.innerHTML = "O NO! A wild critical bug appears, which affects version 1.0.0 onwards.";
}

function finishBugfixOn100() {
    v100_support_branch.merge(v10x_branch, {message: "Official 1.0.1 release", tag: "1.0.1", dotStrokeWidth: 10});
    v10x_branch.merge(develop);
    v100_support_branch.merge(v11x_branch, {message: "Official 1.1.1 release", tag: "1.1.1", dotStrokeWidth: 10});
    v11x_branch.merge(develop);
    doStuffButton.onclick = mergeDevelopInto200;
    description.innerHTML = "Our brave developers fix the bug, on the hotfix branch. \n" +
        "All relevant released versions receive the bugfix, releasing (and tagging!) new minor-minor versions. \n" +
        "New released versions are merged back into develop (develop should always be the shpitz)";
}

function mergeDevelopInto200() {
    develop.merge(develop_2xx_branch);
    doStuffButton.onclick = startRelease200;
    description.innerHTML = "As often as possible, we should merge develop into develop_v2, to ensure we don't diverge. " +
        "Eventually we'll stop work on new features for v1, and advance develop to point at develop_v2.";
}

var release200branch;
function startRelease200() {
    release200branch = gitgraph.branch({parentBranch:develop_2xx_branch, name:"rc/v2.0.0", column:release_200_col});
    release200branch.commit();
    doStuffButton.onclick = release200;
    description.innerHTML = "Releases for v2 can happen in parallel to all work on v1";
}

var v20xbranch;
function release200() {
    v20xbranch = gitgraph.branch({parentBranch:release200branch, name:"v2.0.x", column:v20x_col});
    v20xbranch.commit({message: "Official 2.0.0 release", tag: "2.0.0", dotStrokeWidth: 10});
    v20xbranch.merge(develop_2xx_branch);
    doStuffButton.onclick = null;
}
