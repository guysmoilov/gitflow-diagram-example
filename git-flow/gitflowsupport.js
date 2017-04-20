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
var featureCol1 = 0;
var featureCol2 = 1;
var developCol = 2;
var releaseCol = 3;
var ver10xCol = 4;
var supportCol = 5;
var ver11xCol = 6;

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
function developDuring100rc() {
    develop.commit({messageDisplay:false});
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
    v100_support_branch = gitgraph.branch({parentBranch:v10x_branch, name:"v1.0.0_HF", column:supportCol});
    v100_support_branch.commit();
    doStuffButton.onclick = finishBugfixOn100;
}

function finishBugfixOn100() {
    v100_support_branch.merge(v10x_branch, {message: "Official 1.0.1 release", tag: "1.0.1", dotStrokeWidth: 10});
    v10x_branch.merge(develop);
    v100_support_branch.merge(v11x_branch, {message: "Official 1.1.1 release", tag: "1.1.1", dotStrokeWidth: 10});
    v11x_branch.merge(develop);
    doStuffButton.onclick = null;
}