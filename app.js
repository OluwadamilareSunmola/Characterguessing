import React, { useState, useEffect } from "react";
import { BinaryTree } from "./binaryTree";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({ apiKey: "YOUR_OPENAI_API_KEY" }); // Replace with your OpenAI API key
const openai = new OpenAIApi(configuration);

const App = () => {
    const [tree] = useState(new BinaryTree()); // Binary tree instance
    const [currentNode, setCurrentNode] = useState(tree.root); // Current question node
    const [history, setHistory] = useState([]); // Navigation history for backtracking
    const [isLearning, setIsLearning] = useState(false); // Learning mode
    const [newQuestion, setNewQuestion] = useState("");
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [incorrectAnswer, setIncorrectAnswer] = useState("");

    // Load tree from localStorage
    useEffect(() => {
        const savedTree = localStorage.getItem("binaryTree");
        if (savedTree) {
            const parsedTree = JSON.parse(savedTree);
            tree.root = rebuildTree(parsedTree);
        }
    }, []);

    // Save tree to localStorage on change
    useEffect(() => {
        localStorage.setItem("binaryTree", JSON.stringify(tree.root));
    }, [tree]);

    // Handle user response
    const handleResponse = (response) => {
        if (currentNode.isLeaf()) return;
        setHistory([...history, currentNode]); // Save history
        setCurrentNode(tree.traverse(currentNode, response));
    };

    // Restart the game
    const restartGame = () => {
        setCurrentNode(tree.root);
        setHistory([]);
        setIsLearning(false);
    };

    // Enable learning mode
    const enableLearning = () => {
        setIsLearning(true);
    };

    // Add new knowledge to the tree
    const handleLearn = () => {
        if (!newQuestion || !correctAnswer || !incorrectAnswer) return;
        tree.addKnowledge(currentNode, newQuestion, correctAnswer, currentNode.question);
        setIsLearning(false);
        restartGame();
    };

    // Generate a new question using OpenAI API
    const generateQuestion = async () => {
        if (!correctAnswer || !incorrectAnswer) return;
        try {
            const response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: `Suggest a question to distinguish between "${correctAnswer}" and "${incorrectAnswer}".`,
                max_tokens: 50,
            });
            setNewQuestion(response.data.choices[0].text.trim());
        } catch (error) {
            console.error("Error generating question:", error);
        }
    };

    // Rebuild the tree from JSON (recursively)
    const rebuildTree = (data) => {
        if (!data) return null;
        const node = new BinaryTree(data.question);
        node.yes = rebuildTree(data.yes);
        node.no = rebuildTree(data.no);
        return node;
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1>Interactive Character Guessing Game</h1>
            {isLearning ? (
                <div>
                    <h3>Help us improve!</h3>
                    <label>
                        New Question:
                        <input
                            type="text"
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            style={{ display: "block", margin: "10px 0" }}
                        />
                    </label>
                    <label>
                        Correct Answer:
                        <input
                            type="text"
                            value={correctAnswer}
                            onChange={(e) => setCorrectAnswer(e.target.value)}
                            style={{ display: "block", margin: "10px 0" }}
                        />
                    </label>
                    <label>
                        Incorrect Answer:
                        <input
                            type="text"
                            value={incorrectAnswer}
                            onChange={(e) => setIncorrectAnswer(e.target.value)}
                            style={{ display: "block", margin: "10px 0" }}
                        />
                    </label>
                    <button onClick={generateQuestion} style={{ marginRight: "10px" }}>
                        Generate Question
                    </button>
                    <button onClick={handleLearn}>Save</button>
                </div>
            ) : (
                <div>
                    <p>{currentNode.question}</p>
                    {currentNode.isLeaf() ? (
                        <div>
                            <button onClick={enableLearning}>No, help us improve!</button>
                            <button onClick={restartGame}>Restart Game</button>
                        </div>
                    ) : (
                        <div>
                            <button onClick={() => handleResponse("yes")} style={{ marginRight: "10px" }}>
                                Yes
                            </button>
                            <button onClick={() => handleResponse("no")}>No</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default App;
