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
}
doStuffButton.onclick = startTwoFeatures;

var release_100;
function startReleaseBranch100() {
    release_100 = gitgraph.branch({parentBranch: develop, name: "release/v1.0.0", column:releaseCol});
    release_100.commit({message:"Start v1.0.0-rc Release Candidate builds"});
    doStuffButton.onclick = developDuring100rc;
}

var feature3 = gitgraph.branch({parentBranch:develop, name:"feature/3", column:featureCol2});
var develop_2xx_branch;
function developDuring100rc() {
    develop.commit({messageDisplay:false});
    develop_2xx_branch = gitgraph.branch({parentBranch: develop, name: "develop_v2", column:develop_2xx_col});
    doStuffButton.onclick = stabilizeRc100;
}

function stabilizeRc100() {
    release_100.commit(stablizationCommit);
    doStuffButton.onclick = releaseRc100;
}

var v10x_branch;
function releaseRc100() {
    v10x_branch = gitgraph.branch({parentBranch:release_100, name:"v1.0.x", column:ver10xCol});
    v10x_branch.commit({message: "Official 1.0.0 release", tag: "1.0.0", dotStrokeWidth: 10});
    v10x_branch.merge(develop);
    doStuffButton.onclick = developFor200InParallel;
}

function developFor200InParallel() {
    develop_2xx_branch.commit();
    develop_2xx_branch.commit();
    doStuffButton.onclick = developAndRelease110;
}

var v11x_branch;
var release_110;
function developAndRelease110() {
    develop.commit();
    develop.commit();
    release_110 = gitgraph.branch({parentBranch: develop, name: "release/v1.1.0", column:releaseCol});
    release_110.commit({message: "Bump version from 1.0.0 to 1.1.0"});
    v11x_branch = gitgraph.branch({parentBranch:release_110, name:"v1.1.x", column:ver11xCol});
    v11x_branch.commit({message: "Official 1.1.0 release", tag: "1.1.0", dotStrokeWidth: 10});
    v11x_branch.merge(develop);
    doStuffButton.onclick = bugfixOn100;
}

var v100_support_branch;
function bugfixOn100() {
    v100_support_branch = gitgraph.branch({parentBranch:v10x_branch, name:"v1.0.0_HF1", column:supportCol});
    v100_support_branch.commit();
    doStuffButton.onclick = finishBugfixOn100;
}

function finishBugfixOn100() {
    v100_support_branch.merge(v10x_branch, {message: "Official 1.0.1 release", tag: "1.0.1", dotStrokeWidth: 10});
    v10x_branch.merge(develop);
    v100_support_branch.merge(v11x_branch, {message: "Official 1.1.1 release", tag: "1.1.1", dotStrokeWidth: 10});
    v11x_branch.merge(develop);
    doStuffButton.onclick = mergeDevelopInto200;
}

function mergeDevelopInto200() {
    develop.merge(develop_2xx_branch);
    doStuffButton.onclick = startRelease200;
}

var release200branch;
function startRelease200() {
    release200branch = gitgraph.branch({parentBranch:develop_2xx_branch, name:"release/v2.0.0", column:release_200_col});
    release200branch.commit();
    doStuffButton.onclick = release200;
}

var v20xbranch;
function release200() {
    v20xbranch = gitgraph.branch({parentBranch:release200branch, name:"v2.0.x", column:v20x_col});
    v20xbranch.commit({message: "Official 2.0.0 release", tag: "2.0.0", dotStrokeWidth: 10});
    v20xbranch.merge(develop_2xx_branch);
    doStuffButton.onclick = null;
}
