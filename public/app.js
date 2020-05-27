const getCurrency = amount => {
    return new Intl.NumberFormat('us-US', {
        currency: 'usd',
        style: 'currency'
    }).format(amount);
};

document.querySelectorAll('.price').forEach(node => {
    node.textContent = getCurrency(node.textContent);
});

const getDate = date => {
    return new Intl.DateTimeFormat('us-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(new Date(date))
};

document.querySelectorAll('.date').forEach(node => {
    node.textContent = getDate(node.textContent);
});

const cartContainer = document.querySelector('#cart')
if (cartContainer) {
    cartContainer.addEventListener('click', event => {
        if (event.target.classList.contains('js-remove')) {
            const id = event.target.dataset.id;

            fetch('/cart/remove/' + id, {
                method: 'delete'
            })
                .then(res => res.json())
                .then(cart => {
                    if (cart.courses.length) {
                        const coursesHtml = cart.courses.map(item => {
                            return `
                                <tr>
                                    <td>${item.title}</td>
                                    <td>${item.count}</td>
                                    <td>
                                        <button class="btn btn-small js-remove" data-id="${item.id}">Remove</button>
                                    </td>
                                </tr>
                            `;
                        }).join('');

                        cartContainer.querySelector('tbody').innerHTML = coursesHtml;
                        cartContainer.querySelector('.price').textContent = getCurrency(cart.price);
                    } else {
                        cartContainer.innerHTML = '<p>No added courses here</p>';
                    }
                });
        }
    });
}

var instance = M.Tabs.init(document.querySelectorAll('.tabs'));