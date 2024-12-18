let remainingPrizes = [...sectors];
let isSpinning = false;

class SlotMachine {
    constructor() {
        this.reels = Array.from(document.querySelectorAll('.reel-container'));
        this.spinButton = document.getElementById('spin-button');
        this.resultDisplay = document.getElementById('result');
        this.visibleItems = 5;
        this.itemHeight = 60;

        this.init();
    }

    init() {
        this.initializeReels();
        this.spinButton.addEventListener('click', () => this.spin());
    }

    // Создаем начальное состояние барабана
    initializeReels() {
        this.reels.forEach(reel => {
            this.populateReel(reel);
            reel.style.top = '0px';
        });
    }

    populateReel(reel) {
        reel.innerHTML = '';
        const items = this.getRandomPrizes(this.visibleItems + 2);
        items.forEach(prize => {
            const div = document.createElement('div');
            div.className = 'prize-item';
            div.textContent = prize;
            reel.appendChild(div);
        });
    }

    getRandomPrizes(count) {
        const prizes = [];
        for (let i = 0; i < count; i++) {
            const availablePrizes = remainingPrizes.length > 0 ? remainingPrizes : sectors;
            const randomIndex = Math.floor(Math.random() * availablePrizes.length);
            prizes.push(availablePrizes[randomIndex]);
        }
        return prizes;
    }

    async spinReel(reel, delay) {
        return new Promise(resolve => {
            setTimeout(() => {
                reel.style.transition = 'top 10s cubic-bezier(0.1, 0.9, 0.3, 1.0)';
                reel.style.top = `-${this.itemHeight * (reel.children.length - this.visibleItems)}px`;

                const newPrizes = this.getRandomPrizes(reel.children.length);
                newPrizes.forEach(prize => {
                    const div = document.createElement('div');
                    div.className = 'prize-item';
                    div.textContent = prize;
                    reel.insertBefore(div, reel.firstChild);
                });

                setTimeout(() => {
                    const centerIndex = Math.floor(this.visibleItems / 2) + 2;
                    const centerItem = reel.children[centerIndex];
                    centerItem.classList.add('highlight');
                    resolve(centerItem.textContent);
                }, 10000);
            }, delay);
        });
    }


    async spin() {
        if (isSpinning || remainingPrizes.length < 3) return;

        isSpinning = true;
        this.spinButton.disabled = true;
        this.resultDisplay.textContent = '';

        try {
            const results = await Promise.all([
                this.spinReel(this.reels[0], 0),
                this.spinReel(this.reels[1], 200),
                this.spinReel(this.reels[2], 400)
            ]);

            results.forEach(prize => {
                const index = remainingPrizes.indexOf(prize);
                if (index !== -1) {
                    remainingPrizes.splice(index, 1);
                }
            });

            this.showResults(results);

        } catch (error) {
            console.error('Ошибка при вращении:', error);
            this.resultDisplay.textContent = 'Произошла ошибка';
        } finally {
            isSpinning = false;
            this.spinButton.disabled = remainingPrizes.length < 3;

            if (remainingPrizes.length < 3) {
                this.showGameOver();
            }
        }
    }

    showResults(results) {
        this.resultDisplay.textContent = `Выпали призы: ${results.join(', ')}`;
    }

    showGameOver() {
        const gameOver = document.createElement('div');
        gameOver.className = 'game-over';
        gameOver.innerHTML = `
            <h2>Игра завершена!</h2>
            <p>Все призы разыграны</p>
            <button onclick="slotMachine.resetGame()">Начать заново</button>
        `;
        document.querySelector('.container').appendChild(gameOver);
    }

    resetGame() {
        remainingPrizes = [...sectors];
        document.querySelector('.game-over')?.remove();
        this.spinButton.disabled = false;
        this.resultDisplay.textContent = '';
        this.initializeReels();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.slotMachine = new SlotMachine();
});