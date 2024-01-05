class Controls{
    constructor(type){
        this.forward = false;
        this.left = false;
        this.right = false;
        this.backward = false;

        switch(type){
            case "KEYS":
                this.#addKeyListeners();
                break;
            case "DUMMY":
                this.forward = true;
                break;
        }
    }

    #addKeyListeners(){
        document.onkeydown = (event) => {
            switch(event.key){
                case 'w':
                    this.forward = true;
                    break;
                case 's':
                    this.backward = true;
                    break;
                case 'a':
                    this.left = true;
                    break;
                case 'd':
                    this.right = true;
                    break;
            }
            console.table(this);
        }

        document.onkeyup = (event) => {
            switch(event.key){
                case 'w':
                    this.forward = false;
                    break;
                case 's':
                    this.backward = false;
                    break;
                case 'a':
                    this.left = false;
                    break;
                case 'd':
                    this.right = false;
                    break;
            }
            console.table(this);
        }
    }
}