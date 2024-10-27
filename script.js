// Get references to DOM elements
const mazeContainer = document.getElementById('maze');
const moveCountDisplay = document.getElementById('moveCount');
const timerDisplay = document.getElementById('timer');
const successMessage = document.getElementById('successMessage');
const gridSizeSelect = document.getElementById('gridSize');
const generateMazeButton = document.getElementById('generateMaze');
const showSolutionButton = document.getElementById('showSolution');

// Initialize variables for grid size, maze structure, move count, timer, timer interval, and player position
let gridSize = parseInt(gridSizeSelect.value); // Initial grid size
let maze = []; // 2D array to hold maze structure
let moveCount = 0; // Count of player moves
let timer = 0; // Timer for counting elapsed time
let timerInterval = null; // Timer interval ID
let playerPosition = { x: 1, y: 1 }; // Player's starting position

// Function to start the timer
function startTimer() {
    if (!timerInterval) {
        timerInterval = setInterval(() => {
            timer++; // Increment timer every second
            timerDisplay.textContent = `${timer}`; // Update timer display
        }, 1000);
    }
}

// Function to generate the maze using Prim's algorithm
function generateMaze() {
    gridSize = parseInt(gridSizeSelect.value); // Update grid size based on user selection
    maze = Array.from({ length: gridSize }, () => Array(gridSize).fill(1)); // Initialize maze with walls (1)

    let walls = []; // Array to hold walls to be checked
    maze[1][1] = 0; // Set starting position as path (0)
    walls.push({ x: 1, y: 1 }); // Add starting position to walls list

    // While there are walls to check
    while (walls.length) {
        let wallIndex = Math.floor(Math.random() * walls.length); // Pick a random wall
        let { x, y } = walls[wallIndex]; // Get wall's coordinates
        let directions = [ // Possible directions to check
            { dx: 2, dy: 0 },
            { dx: -2, dy: 0 },
            { dx: 0, dy: 2 },
            { dx: 0, dy: -2 }
        ];
        // Check each direction
        for (let { dx, dy } of directions) {
            let nx = x + dx, ny = y + dy; // Calculate new coordinates
            // If new coordinates are within bounds and the cell is a wall
            if (nx > 0 && nx < gridSize - 1 && ny > 0 && ny < gridSize - 1 && maze[nx][ny] === 1) {
                maze[nx][ny] = 0; // Set the new cell as path
                maze[x + dx / 2][y + dy / 2] = 0; // Create a path between the wall and the new cell
                walls.push({ x: nx, y: ny }); // Add new cell to walls to check
            }
        }
        walls.splice(wallIndex, 1); // Remove the wall from the list of walls
    }

    maze[1][1] = 2;  // Set player's starting position (2)
    maze[gridSize - 2][gridSize - 2] = 3;  // Set end position (3)
}

// Function to draw the maze in the DOM
function drawMaze() {
    mazeContainer.style.gridTemplateColumns = `repeat(${gridSize}, 20px)`; // Set the grid layout
    mazeContainer.innerHTML = ''; // Clear existing maze

    // Loop through the maze array to create cells
    maze.forEach((row, y) => {
        row.forEach((cell, x) => {
            const div = document.createElement('div'); // Create a new div for the cell
            div.classList.add('cell'); // Add 'cell' class to the div
            if (cell === 0) div.classList.add('path'); // Add 'path' class for paths
            if (cell === 2) div.classList.add('player'); // Add 'player' class for player position
            if (cell === 3) div.classList.add('end'); // Add 'end' class for end position
            mazeContainer.appendChild(div); // Append the div to the maze container
        });
    });
}

// Function to move the player in the maze
function movePlayer(dx, dy) {
    const newX = playerPosition.x + dx; // Calculate new X position
    const newY = playerPosition.y + dy; // Calculate new Y position

    // Check if the new position is within bounds and not a wall
    if (newX >= 0 && newY >= 0 && newX < gridSize && newY < gridSize && maze[newY][newX] !== 1) {
        maze[playerPosition.y][playerPosition.x] = 0; // Mark previous position as path
        playerPosition.x = newX; // Update player position
        playerPosition.y = newY;
        maze[newY][newX] = 2; // Set new player position in the maze

        moveCount++; // Increment move count
        moveCountDisplay.textContent = `${moveCount}`; // Update move count display

        const playerCell = mazeContainer.children[newY * gridSize + newX]; // Get the cell element for the new position
        playerCell.classList.add('move-animation'); // Add animation class for the move
        setTimeout(() => {
            playerCell.classList.remove('move-animation'); // Remove animation class after a delay
        }, 300); // Delay for the animation duration

        // Check if the player has reached the end
        if (newX === gridSize - 2 && newY === gridSize - 2) {
            clearInterval(timerInterval); // Stop the timer
            successMessage.textContent = `Congratulations! You completed it in ${moveCount} moves and ${timer} seconds.`; // Show success message
            successMessage.classList.remove('hidden'); // Make success message visible
            setTimeout(resetGame, 3000); // Reset game after a delay
        } else {
            drawMaze(); // Redraw the maze to update the player's position
        }
    }
}

// Event listener for player controls using arrow keys
window.addEventListener('keydown', (e) => {
    startTimer(); // Start the timer when a key is pressed
    switch (e.key) {
        case 'ArrowUp':
            movePlayer(0, -1); // Move up
            break;
        case 'ArrowDown':
            movePlayer(0, 1); // Move down
            break;
        case 'ArrowLeft':
            movePlayer(-1, 0); // Move left
            break;
        case 'ArrowRight':
            movePlayer(1, 0); // Move right
            break;
    }
});

// Function to reset the game
function resetGame() {
    moveCount = 0; // Reset move count
    timer = 0; // Reset timer
    clearInterval(timerInterval); // Clear the timer
    timerInterval = null; // Reset timer interval
    moveCountDisplay.textContent = `${moveCount}`; // Update move count display
    timerDisplay.textContent = `${timer}`; // Update timer display
    playerPosition = { x: 1, y: 1 }; // Reset player position
    successMessage.classList.add('hidden'); // Hide success message
    generateMaze(); // Generate a new maze
    drawMaze(); // Draw the new maze
}

// Event listener for the "Show Solution" button
showSolutionButton.addEventListener('click', showSolution);

// Function to show the solution path in the maze
function showSolution() {
    const path = findPath(1, 1, gridSize - 2, gridSize - 2); // Find path from start to end
    if (path) {
        path.forEach(([x, y]) => {
            const cell = mazeContainer.children[y * gridSize + x]; // Get the cell for each part of the path
            cell.classList.add('solution'); // Add class for solution styling
        });
    } else {
        alert("No path found!"); // Alert if no path exists
    }
}

// Function to find the path from (sx, sy) to (ex, ey) using Depth-First Search (DFS)
function findPath(sx, sy, ex, ey) {
    const stack = [[sx, sy]]; // Stack for DFS
    const visited = Array.from({ length: gridSize }, () => Array(gridSize).fill(false)); // Track visited cells
    visited[sy][sx] = true; // Mark starting position as visited
    const parent = {}; // Object to store the path

    while (stack.length) {
        const [x, y] = stack.pop(); // Get the current cell

        // Check if the end position is reached
        if (x === ex && y === ey) {
            const path = []; // Array to hold the path
            let [cx, cy] = [x, y]; // Current cell
            while (parent[`${cx},${cy}`]) { // Backtrack to find the path
                path.push([cx, cy]);
                [cx, cy] = parent[`${cx},${cy}`];
            }
            return path.reverse(); // Return the path in correct order
        }

        // Check possible moves
        const directions = [
            [1, 0], // Right
            [-1, 0], // Left
            [0, 1], // Down
            [0, -1] // Up
        ];

        for (const [dx, dy] of directions) {
            const nx = x + dx; // New X position
            const ny = y + dy; // New Y position

            // If new position is valid and not visited
            if (nx >= 0 && ny >= 0 && nx < gridSize && ny < gridSize && !visited[ny][nx] && maze[ny][nx] !== 1) {
                visited[ny][nx] = true; // Mark as visited
                parent[`${nx},${ny}`] = [x, y]; // Store parent cell
                stack.push([nx, ny]); // Add new position to stack
            }
        }
    }
    return null; // Return null if no path is found
}

// Event listener to regenerate maze when the button is clicked
generateMazeButton.addEventListener('click', () => {
    resetGame(); // Reset game and generate a new maze
    drawMaze(); // Draw the new maze
});

// Initial maze generation and drawing
generateMaze(); // Generate maze
drawMaze(); // Draw maze
