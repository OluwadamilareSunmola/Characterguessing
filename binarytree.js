class TreeNode {
    constructor(question, yes = null, no = null) {
        this.question = question;
        this.yes = yes; // Yes branch
        this.no = no;   // No branch
    }

    // Check if this is a leaf node (final guess)
    isLeaf() {
        return !this.yes && !this.no;
    }
}

export class BinaryTree {
    constructor() {
        // Initial tree (can be expanded)
        this.root = new TreeNode(
            "Is your character fictional?",
            new TreeNode(
                "Is your character from a movie?",
                new TreeNode("Is your character Harry Potter?"),
                new TreeNode("Is your character Superman?")
            ),
            new TreeNode(
                "Is your character a scientist?",
                new TreeNode("Is your character Albert Einstein?"),
                new TreeNode("Is your character Elon Musk?")
            )
        );
    }

    // Traverse the tree using user responses
    traverse(node, answer) {
        return answer === "yes" ? node.yes : node.no;
    }

    // Add new knowledge to the tree
    addKnowledge(node, newQuestion, correctAnswer, incorrectAnswer) {
        const newLeaf = new TreeNode(correctAnswer);
        node.question = newQuestion;
        node.yes = newLeaf;
        node.no = new TreeNode(incorrectAnswer);
    }
}

export default TreeNode;
