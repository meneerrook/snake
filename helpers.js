const helpers = {
    getRandomValueInRangeWithStep: (x, y, z) => {
        const range = y - x;
        const numberOfSteps = range / z;
        const randomStepIndex = Math.floor(Math.random() * (numberOfSteps + 1));
        const randomValue = x + randomStepIndex * z;
        return randomValue;
    },
    elementWithinContainerYAxis: (target, container, offset = 0) => {
        const targetRect = target.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const isInside =
            (targetRect.top - offset) >= containerRect.top &&
            (targetRect.bottom + offset) <= containerRect.bottom;

        return isInside;

    },
    elementWithinContainerXAxis: (target, container, offset = 0) => {
        const targetRect = target.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const isInside =
            (targetRect.left - offset) >= containerRect.left &&
            (targetRect.right + offset) <= containerRect.right;

        return isInside;
    },
    areElementsIntersecting: (elementA, elementB) => {
        const rectA = elementA.getBoundingClientRect();
        const rectB = elementB.getBoundingClientRect();

        return !(
            rectA.right < rectB.left ||
            rectA.left > rectB.right ||
            rectA.bottom < rectB.top ||
            rectA.top > rectB.bottom
        );
    },
    getRandomNumber: (min, max) => {
        min = Math.floor(min);
        max = Math.floor(max);

        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

window.snake = { helpers }