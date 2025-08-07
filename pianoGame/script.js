const button = document.querySelectorAll('.button');

buttons.forEach(button => {
    button.addEventListener('click', function() {
        const note = this.getAttribute('data-note');
        alert('You clicked note: ' + note);
    });
});