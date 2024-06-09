const cardDivs = document.querySelectorAll('.card img');
const displayedCard = document.querySelector('.displayed-card');

cardDivs.forEach(cardDiv => {
    cardDiv.addEventListener('mouseover', () => {
        const imageSrc = cardDiv.src;
        const imgageElement = document.createElement('img');
        imgageElement.src = imageSrc;

        displayedCard.innerHTML = '';
        displayedCard.appendChild(imgageElement);
        displayedCard.style.display = 'block';
    });

    cardDiv.addEventListener('mouseout', () => {
        displayedCard.innerHTML = '';
        displayedCard.style.display = 'none';
    });
});

const cardsNotInPlayerHand = document.querySelectorAll('.player-in-play-creatures .card, .player-in-play-lands .card, .player-in-play-enchantments .card');

cardsNotInPlayerHand.forEach(cardDiv => {
    cardDiv.addEventListener('click', () => {
        cardDiv.classList.toggle('tapped');
    });
});

const playerHandCards = document.querySelectorAll('.player-hand .card');

playerHandCards.forEach(cardDiv => {
    cardDiv.addEventListener('click', (event) => {
        const menu = document.createElement('div');
        menu.classList.add('menu');
        
        const option1 = document.createElement('div');
        option1.textContent = 'Put into play';
        option1.addEventListener('click', () => {
            menu.remove();
        });

        const option2 = document.createElement('div');
        option2.textContent = 'Put into graveyard';
        option2.addEventListener('click', () => {
            const card = event.currentTarget;
            card.parentNode.removeChild(card); 
            const graveyard = document.querySelector('.player-graveyard');
            graveyard.appendChild(card);
            menu.remove();
        });
        
        const option3 = document.createElement('div');
        option3.textContent = 'Cancel';
        option3.addEventListener('click', () => {
            menu.remove();
        });

        menu.appendChild(option1);
        menu.appendChild(option2);
        menu.appendChild(option3);

        menu.style.position = 'absolute';
        menu.style.top = `${event.clientY}px`;
        menu.style.left = `${event.clientX}px`;

        document.body.appendChild(menu);

        event.preventDefault();
    });
});