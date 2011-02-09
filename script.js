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

// Normalize this
const wall_density = 1/5;

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
    
    startIndex = 0;
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
    console.log("Update map:" + (t1-t0) + "ms");
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

