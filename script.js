// Node representation metrics
const squareSize = 16;
const gap = 3;
const border = 8;
const inner_space = 3;

// Don't touch
const not_traversable = -1;
const off_path = 0;
const on_path = 1;
const expanded = 2;

// Interface colors
const off_path_color = "grey";
const on_path_color = "green";
const expanded_color = "blue";
const mouse_over_color = "red"
const mouse_off_color = "black";
const start_node_color = "blue";
const goal_node_color = "green";
const select_node_color = "purple";

// Normalize!
const wall_density = 0;

// HTML5 stuff
window.onload = init;
var canvas = null;
var canvasContext = null;
var mouseX = 0, mouseY = 0;

// App state defaults
var nodeArray = null;
var wide = 0;
var high = 0;
var length = 0;
var goalIndex = 0;
var startIndex = 0;

function dotproduct(a,b) { return (a.x * b.x) + (a.y * b.y); }

function init()
{
    // Get the canvas element to display the game in.
    canvas = document.getElementById('display');
    canvas.width = document.body.offsetWidth;
    canvas.height = window.innerHeight - 150;
    
    // Get graphics contexts for the canvas elements
    canvasContext = canvas.getContext("2d");
    canvasContext.strokeStyle = "black";
    canvasContext.lineWidth = 1;
    
    configureEventBindings();
    
    wide = Math.floor((canvas.width - border * 2) / (squareSize + gap));
    high = Math.floor((canvas.height - border * 2) / (squareSize + gap));
    length = wide * high;
    
    nodeArray = new Array(length);
    
    nodeArray[0] = off_path;
    for (var i = length - 1; i > 0; i--)
    {
        if (Math.random() > wall_density)
            nodeArray[i] = off_path;
        else
            nodeArray[i] = not_traversable;
    }
    
    startIndex = 10 + 10 * wide;
    goalIndex = length - 1;
    
    updateMap();
    
    //nodeArray[5 + (3*wide)] = 2;
    //updateSquare(5,3);
}

function updateMap()
{
    var t0 = new Date();
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    var ind = -1;
    for (var y = high - 1; y >= 0; y--)
    {
        for (var x = wide - 1; x >= 0; x--)
        {
            ind = x + (y * wide);
            
            if (ind == startIndex)
            {
                if (ind == mouseX + (mouseY * wide))
                    canvasContext.strokeStyle = select_node_color;
                else
                    canvasContext.strokeStyle = start_node_color;
            } else if (ind == goalIndex) {
                if (ind == mouseX + (mouseY * wide))
                    canvasContext.strokeStyle = select_node_color;
                else
                    canvasContext.strokeStyle = goal_node_color;
            } else if (ind == mouseX + (mouseY * wide)) {
                canvasContext.strokeStyle = mouse_over_color;
            } else {
                canvasContext.strokeStyle = mouse_off_color;
            }
            
            canvasContext.strokeRect(border + x * (squareSize + gap),
                border + y * (squareSize + gap), squareSize, squareSize);
            
            if (nodeArray[ind] == not_traversable) continue;
            
            switch (nodeArray[ind])
            {
                case off_path:
                canvasContext.fillStyle = off_path_color;
                break;
                
                case expanded:
                canvasContext.fillStyle = expanded_color;
                break;
                
                case on_path:
                default:
                canvasContext.fillStyle = on_path_color;
                break;
            }
            
            canvasContext.fillRect(border + x * (squareSize + gap) + inner_space,
                border + y * (squareSize + gap) + inner_space,
                squareSize - inner_space * 2, squareSize - inner_space * 2);
        }
    }
    var t1 = new Date();
    // console.log("Update map:" + (t1-t0) + "ms");
}

function updateSquare(x,y)
{
    var ind = x + (y*wide);
    
    if (ind < 0 || ind >= length || x < 0 || x >= wide)
        return false;
    
    if (ind == startIndex)
    {
        if (ind == mouseX + (mouseY * wide))
            canvasContext.strokeStyle = select_node_color;
        else
            canvasContext.strokeStyle = start_node_color;
    } else if (ind == goalIndex) {
        if (ind == mouseX + (mouseY * wide))
            canvasContext.strokeStyle = select_node_color;
        else
            canvasContext.strokeStyle = goal_node_color;
    } else if (ind == mouseX + (mouseY * wide)) {
        canvasContext.strokeStyle = mouse_over_color;
    } else {
        canvasContext.strokeStyle = mouse_off_color;
    }
    
    // The +/- 1 here is to compensate for the way antialiasing happens on
    // OS X webkit
    canvasContext.clearRect(border + x * (squareSize+gap) - 1,
            border + y * (squareSize+gap) - 1,
            squareSize + 2, squareSize + 2);
    
    canvasContext.strokeRect(border + x * (squareSize + gap),
        border + y * (squareSize + gap), squareSize, squareSize);
    
    if (nodeArray[ind] == not_traversable)
        return true;
    
    switch (nodeArray[ind])
    {
        case off_path:
        canvasContext.fillStyle = off_path_color;
        break;
        
        case expanded:
        canvasContext.fillStyle = expanded_color;
        break;
        
        case on_path:
        default:
        canvasContext.fillStyle = on_path_color;
        break;
    }
        
    canvasContext.fillRect(border + x * (squareSize + gap) + inner_space,
        border + y * (squareSize + gap) + inner_space,
        squareSize - inner_space * 2, squareSize - inner_space * 2);
    
    return true;
}

function configureEventBindings()
{
    // Set up click handlers
    window.onmousemove = mouseHandler;
    window.onmousedown = mousedownHandler;
    window.onresize = init;
}

function newSearch()
{
    if (nodeArray[0] != not_traversable)
        nodeArray[0] = off_path;
    
    for (var i = length - 1; i > 0; i--)
    {
        if (nodeArray[i] != not_traversable)
            nodeArray[i] = off_path;
    }
    
    var t0 = new Date();
    var result = astar({y:10, x:10}, {x:mouseX, y:mouseY});
    var t1 = new Date();
    
    // console.log("Search took "+ (t1-t0)+"ms.");
    
    var e = result.e;
    var tmp = null;
    for (var i = 0; i < e.length; i++)
    {
        tmp = e[i];
        nodeArray[e[i].x + (e[i].y*wide)] = expanded;
    }
    
    var count = -1;
    if (result.r != null)
    {
        //console.log("estimate: " + knightsMoveHeuristic({y:10, x:10}, {x:mouseX, y:mouseY}));
        var n = result.r;
        while (n.prev != null)
        {
            nodeArray[n.x + n.y * wide] = on_path;
            n = n.prev;
            count++;
        }
    }
    
    document.getElementById('time').innerHTML = "Search time: "+ (t1-t0) + "ms";
    document.getElementById('count').innerHTML = "Expanded nodes: "+ e.length +
        " / " + length;
    document.getElementById('path').innerHTML = "Path length: " + (count > -1 ?
        count + 1: "No path.");
    
    updateMap();
}

function mousedownHandler(evt)
{
    var ind = mouseX + mouseY * wide;
    if (ind == goalIndex || ind < 0 || ind >= length) return true;
    if (nodeArray[ind] == not_traversable) return false;
    
    var oldGoalX = goalIndex % wide;
    var oldGoalY = (goalIndex - oldGoalX) / wide;
    
    goalIndex = ind;
    updateSquare(mouseX, mouseY);
    updateSquare(oldGoalX, oldGoalY);
    
    newSearch();
    
    return false;
}

function mouseHandler(evt) 
{
    var oldx = mouseX;
    var oldy = mouseY;
    
    mouseX = evt.pageX - canvas.offsetLeft;
    mouseY = evt.pageY - canvas.offsetTop;
    
    mouseX = Math.floor((mouseX - border) / (squareSize + gap));
    mouseY = Math.floor((mouseY - border) / (squareSize + gap));
    
    updateSquare(oldx, oldy);
    updateSquare(mouseX, mouseY);
    
    return false;
}

function manhattanDistance(x, g)
{
    return (Math.abs(g.y - x.y) + Math.abs(g.x - x.x));
}

function astar(n, goal)
{
    n.f = 0;
    n.h = knightsMoveHeuristic(n, goal);
    n.g = 0;
    n.prev = null;
    
    frontier = [n];
    explored = [];
    
    var node = null;
    var expansion = [];
    var test = false;
    var temp = null;
    
    do {

        node = frontier.shift();
        if (node.x == goal.x && node.y == goal.y) return {r: node, e:explored};
        explored.push(node);
        expansion = knightsActions(node, goal);
        for (var i = 0; i < expansion.length; i++)
        {
            temp = expansion[i];
            if (temp == null) continue;
            
            // Is child in explored?
            test = -1;
            for (var j = 0; j < explored.length; j++)
            {
                if (explored[j].x == temp.x && explored[j].y == temp.y)
                {
                    test = 1;
                    break;
                }
            }
            
            if (test != -1) continue;
            
            // In frontier?
            for (var j = 0; j < frontier.length; j++)
            {
                if (frontier[j].x == temp.x && frontier[j].y == temp.y)
                {
                    test = j;
                    break;
                }
            }
            
            // If not, add it
            if (test == -1)
            {
                if (frontier.length == 0)
                {
                    frontier[0] = temp;
                    continue;
                }
                
                // put this in the frontier
                for (var j = 0; j < frontier.length; j++)
                {
                    if (temp.f < frontier[j].f)
                    {
                        frontier.splice(j, 0, temp);
                        break;
                    }
                }
            } else {
                // is in frontier but not in explored
                if (temp.f < frontier[test].f)
                    frontier[test] = temp;
            }
        }
        
    } while (frontier.length != 0);
    
    return {r: null, e: explored};
}

function knightsActions(n, goal)
{
    var ret = new Array(8);
    var x = 0, y = 0;
    i = 0;
    
    x = n.x - 1; y = n.y - 2;
    if (x >= 0 && y >= 0 && nodeArray[x + y * wide] != not_traversable)
        ret[i] = {x:x, y:y};
    else
        ret[i] = null;
    
    i++;
    x = n.x + 1; y = n.y - 2;
    if (x < wide && y >= 0 && nodeArray[x + y * wide] != not_traversable)
        ret[i] = {x:x, y:y};
    else
        ret[i] = null;
    
    i++;
    x = n.x - 1; y = n.y + 2;
    if (x >= 0 && y < high && nodeArray[x + y * wide] != not_traversable)
        ret[i] = {x:x, y:y};
    else
        ret[i] = null;
    
    i++;
    x = n.x + 1; y = n.y + 2;
    if (x < wide && y < high && nodeArray[x + y * wide] != not_traversable)
        ret[i] = {x:x, y:y};
    else
        ret[i] = null;
    
    i++;
    x = n.x - 2; y = n.y - 1;
    if (x >= 0 && y >= 0 && nodeArray[x + y * wide] != not_traversable)
        ret[i] = {x:x, y:y};
    else
        ret[i] = null;
    
    i++;
    x = n.x - 2; y = n.y + 1;
    if (x >= 0 && y < high && nodeArray[x + y * wide] != not_traversable)
        ret[i] = {x:x, y:y};
    else
        ret[i] = null;
    
    i++;
    x = n.x + 2; y = n.y - 1;
    if (x < wide && y >= 0 && nodeArray[x + y * wide] != not_traversable)
        ret[i] = {x:x, y:y};
    else
        ret[i] = null;
    
    i++;
    x = n.x + 2; y = n.y + 1;
    if (x < wide && y < high && nodeArray[x + y * wide] != not_traversable)
        ret[i] = {x:x, y:y};
    else
        ret[i] = null;
    
    var t = null;
    for (var i = 0; i < ret.length; i++)
    {
        t = ret[i];
        if (t == null) continue;
        
        t.g = manhattanDistance(n,t);
        t.h = knightsMoveHeuristic(t, goal);
        t.f = t.g + t.h;
        t.prev = n;
    }
    
    return ret;
}

function knightsMoveHeuristic(x, g)
{
    // Return the amount of moves from location x to g
    var dist = manhattanDistance(x, g);
    
    // We're not the same node, are we?
    if (dist == 0) return 0;
    
    // Magic!
    var quot = Math.floor(dist / 3);
    if (dist > 3)
        dist % 3;
    else
        quot = 0;
    
    switch (dist)
    {
        case 1:
        // The case that it's closer in distance than any legal move
        // one block up/left/down/right
        return quot + 3;
        break;
        
        case 2:
        // one block diagonally in any direction, or two straight
        return quot + 2;
        break;
        
        case 3:
        // The case where it's within the distance of a legal move
        // It /is/ a legal move
        if (x.x != g.x && x.y != g.y)
            return quot + 1;
        // It's three blocks up/left/down/right from us
        return quot + 3;
        break;
        
        default:
        case 0:
        // This is the only place our estimate breaks down.  If the remainder
        // is zero, when you got within three spaces from the goal you could
        // be within one move, or in the (x->x != g->x || x->y != g->y) case.
        // If THAT were true you'd have to add 3.  However, we can remain
        // admissable by assuming the best case (shortest path) scenario and
        // saying that it will only take 1 move.
        return quot + 1;
        break;
    }
}

