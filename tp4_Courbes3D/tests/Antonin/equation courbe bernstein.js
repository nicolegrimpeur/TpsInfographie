
function binomial(n, k) {
    if ((typeof n !== 'number') || (typeof k !== 'number'))
        return false;
    let coeff = 1;
    for (let x = n - k + 1; x <= n; x++) coeff *= x;
    for (x = 1; x <= k; x++) coeff /= x;
    return coeff;
}

function aled(tab) {
    let degre=tab.length()-1;
    let t;
    let x, y;
    for (let i = 0; i < tab.length; i++) {
        x += tab[i][0] * binomial(degre, i) * Math.pow(1 - t, degre - i) * Math.pow(t, i);
        y += tab[i][1] * binomial(degre, i) * Math.pow(1 - t, degre - i) * Math.pow(t, i);
    }
}