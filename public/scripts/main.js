// const htmlElements = {
//     container: document.getElementById('container'),
//     emailInput: document.getElementById('email'),
//     submit: document.getElementById('submit')
// }

// htmlElements.emailInput.addEventListener("keyup", function (event) {
//     if (event.keyCode === 13) {
//         submitEmail();
//     }
// })

// htmlElements.submit.addEventListener('click', submitEmail);

// function submitEmail() {
//     let email = htmlElements.emailInput.value;
//     fetch('/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email: email })
//     })
//         .then(res => {
//             return res;
//         })
//         .then(data => {
//             console.log(data);
//         })
// }
