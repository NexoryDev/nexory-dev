require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.38.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
    var editor = monaco.editor.create(document.getElementById('editor'), {
        value: "",
        language: "python",
        theme: "vs-dark",
        fontSize: 16,
        automaticLayout: true
    });

    const code = `class NexoryOrg:
    def __init__(self):
    self.name = name

    def join(self, person):
        print(f"{person} has joined {self.name}!")

if __name__ == "__main__":
    orga = NexoryOrg("Nexory.Org")
    orga.join("YOU")
    orga.join("NOW")

    print("Welcome to Nexory.Org")`;

    let i = 0;
    function typeCode() {
        if (i <= code.length) {
            editor.setValue(code.slice(0, i));
            i++;
            setTimeout(typeCode, 5);
        }
    }
    typeCode();
<<<<<<< HEAD
});
=======
});
>>>>>>> 05c0230ec6f00b0a3d3924f3aef7b970cebbbdc1
