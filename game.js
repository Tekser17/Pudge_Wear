function draw(items, equipped){
    const inventory = document.getElementById('Inventory')
    const pudgeItems = document.getElementById('heroPudge')
    let n = 7, m = 7, id = 0
    //console.log(items, equipped)
    for(let i = 1; i <= n; i++){
        for(let j = 1; j <= m; j++){
            id = (i - 1) * n + j
            if(!!document.getElementById(`${id}`)) {
                document.getElementById(`${id}`).remove()
            }
            if(id in items){
                let item = items[id]['item']
                let itemType = items[id]['type']
                //console.log(item)
                inventory.insertAdjacentHTML('beforeend', `<button class="slot ${item} ${itemType}" id="${id}"></button>`)
                const cell = document.getElementById(`${id}`)
                cell.draggable = true
                cell.addEventListener(`dragstart`, ev => {
                    ev.target.classList.add(`selected`)
                })
                cell.addEventListener(`dragend`, ev => {
                    ev.target.classList.remove(`selected`)
                })
            }
            else {
               // inventory.insertAdjacentHTML('beforeend', `<button class="slot" id="${id}">${id}</button>`)//`<div class = "slot" id = "${(i - 1) * n + j}">1</div>`
            }
            if(id in equipped){
                let item = equipped[id]['item']
                let itemType = equipped[id]['type']
                let place = ''
                if('place' in equipped[id]){
                    place = equipped[id]['place']
                    itemType += place
                }
                const equipItems = document.getElementsByClassName(`pudgeSlot`)
                for(let i = 0; i < 8; i++){
                    //console.log(equipItems[i].classList.contains(`${itemType}`), itemType)
                    if(equipItems[i].classList.contains(`${itemType}`)){
                        equipItems[i].style.backgroundImage =  `url("../img/${item}.png")`
                        //equipItems[i].style.background =  'blue'
                        //console.log(`url("../img/${item}.png")`)
                        equipItems[i].classList.add(`${item}`)
                        //console.log(item, itemType)
                        pudgeItems.insertAdjacentHTML('beforeend', `<div draggable="false" class="${itemType}_on_Pudge" id ="Pudge_${itemType}"></div>`)
                        const pudgeSlot = document.getElementById(`Pudge_${itemType}`)
                        //pudgeSlot.style.backgroundImage = `url("../img/${item}.png")`
                        //pudgeSlot.style.width = '4.1666vw'
                        //pudgeSlot.style.height = '5.1546vh'
                        //pudgeSlot.style.position = 'absolute'
                        //pudgeSlot.style.size = '100%'
                    }
                }
            }
        }
        //inventory.insertAdjacentHTML('beforeend', `<div class="break"></div>`)
    }
    inventory.addEventListener('dragover', ev => {
        ev.preventDefault()
    })
    inventory.addEventListener('drop', ev => {
        const curElement = ev.target
        const activeElement = (inventory.querySelector(`.selected`) !== null) ? inventory.querySelector(`.selected`) : document.getElementsByClassName(`selected`)[0]//items.querySelector(`.selected`)
        if (activeElement !== curElement) {
            let item, from, to;
            item = activeElement.classList[2];
            from = activeElement.classList[0];
            to = curElement.classList[0];
            if (item === 'selected') {
                item = 'none'
            }
            if(to === 'inventory'){
                //Запрос на помещение в инвентарь
                activeElement.style.backgroundImage = `url("../img/inventory-${from}-logo.png")`
                activeElement.classList.remove(item)
                //console.log(item, from, to)
                let data = {'item': item, 'take': from, 'put': to}
                const url = "http://localhost:3333/swapItemsValidation"
                swapValid(url, JSON.stringify(data)).then(r => {})
            }
            //swapItems(item, from, to, curElement, activeElement)
        }
    })

    addDragAttributes()
}

const swapValid = async (url, data) => {
    const response = await fetch(url, {
        method: 'POST',
        body: data
    })

    if (!response.ok) {
        throw new Error(`Ошибка при запросе адресса ${url}, статус ошибки: ${response}`);
    } else {
        let raw = await response.json();
        //console.log(raw)
        if(raw.status === 'ok') {
            draw(raw.items, raw.equipped_items)
        }
        return response;
    }
}


function addDragAttributes(){
    const equipItems = document.getElementsByClassName(`pudgeSlot`)
    const inventory = document.getElementById('Inventory')
    const items = document.getElementById('Items')
    for(let i = 0; i < 8; i++){
        equipItems[i].draggable = true
        equipItems[i].addEventListener('dragover', ev => {
            ev.preventDefault()
        })
        equipItems[i].addEventListener(`dragstart`, ev => {
                    ev.target.classList.add(`selected`)
                })
        equipItems[i].addEventListener(`dragend`, ev => {
            ev.target.classList.remove(`selected`)
        })
        equipItems[i].addEventListener(`drop`, ev => {
            const curElement = ev.target
            const activeElement = (inventory.querySelector(`.selected`) !== null) ? inventory.querySelector(`.selected`) : document.getElementsByClassName(`selected`)[0]//items.querySelector(`.selected`)
            if (activeElement !== curElement && curElement.classList.contains(`pudgeSlot`)) {
                //const nextElement = (curElement === activeElement.nextElementSibling) ? curElement.nextElementSibling : curElement
                //equipItems[i].insertBefore(activeElement, nextElement)
                let item, from, to;
                item = activeElement.classList[1];
                from = activeElement.classList[2];
                to = curElement.classList[0];
                if(from === 'selected') {
                    from = activeElement.classList[0]
                }
                if(to.indexOf('necklace') === 0){
                    item = activeElement.classList[2];
                    from = activeElement.classList[0];
                    if(from === 'slot'){
                        from = activeElement.classList[2];
                        item = activeElement.classList[1];
                    }
                }
                swapItems(item, from, to, curElement, activeElement)
            }
        })
    }
}

// curElement - Элемент на котором отпускаем мышку
// activeElement - Элемент который мы перетаскиваем
function swapItems(item, from, to, curElement, activeElement) {
    //console.log(activeElement, curElement)
    //console.log(item, from, ' => ', to)
    /*
    if(from.indexOf('necklace') === 0 && to.indexOf('necklace') === 0) {
        let data = {'item': item, 'take': from, 'put': to}
        const url = "http://localhost:3333/swapItemsValidation"
        swapValid(url, JSON.stringify(data)).then(r => {})
    }
    if(from === to) {
        //curElement.style.background = '#8b8b8b'
        //curElement.style.backgroundImage = `url("../img/${item}.png")`
        //curElement.style.cssText = `background-image: url("../img/${item}.png");`
        //curElement.cssText = `background: #8b8b8b;`
        //curElement.classList.add(`${item}`)
        let data = {'item': item, 'take': from, 'put': to}
        const url = "http://localhost:3333/swapItemsValidation"
        swapValid(url, JSON.stringify(data)).then(r => {})
    }*/

    //Так как переотрисовка в любом случае происходит после запроса на сервер можно не писать лишний код
    //console.log('###',from, to,'###')
    //console.log(activeElement.classList[0], activeElement.classList[1], activeElement.classList[2], activeElement.classList[3],)
    if((from.indexOf('necklace') === 0 && to.indexOf('necklace') === 0)) {
        const x = activeElement.classList[2]
        const y = curElement.classList[2]
        activeElement.classList.remove(x)
        curElement.classList.remove(y)
        activeElement.classList.add(`${y}`)
        curElement.classList.add(`${x}`)
        let data = {'item': item, 'take': from, 'put': to}
        const url = "http://localhost:3333/swapItemsValidation"
        swapValid(url, JSON.stringify(data)).then(r => {})
    }
    else if(from === to) {
        let data = {'item': item, 'take': from, 'put': to}
        const url = "http://localhost:3333/swapItemsValidation"
        swapValid(url, JSON.stringify(data)).then(r => {})
    }
    console.log(item, from, ' => ', to)
}

const takeInventory = async (url) => {
    const response = await fetch(url, {
        method: 'GET'
    })
    if(response.ok){
        console.log(response)
        let raw = await response.json();
        draw(raw.inventory, raw.equipped)
        return response;
    }
}

const inventory_BackUp = async (url) =>{
    const response = await fetch(url, {
        method: 'GET'
    })
    if(response.ok){
        return response;
    }
}

function clearSlots(){
    const equipItems = document.getElementsByClassName(`pudgeSlot`)
    for(let i = 0; i < 8; i++) {
            equipItems[i].style.backgroundImage = ''
    }
}

function start(){
    const url = "http://localhost:3333/takeInventory"
    const backUp = "http://localhost:3333/backUp"
    const reload = document.getElementById('inventory_reload')
    reload.addEventListener('click', ev => {inventory_BackUp(backUp).then(r => {takeInventory(url).then(r => {clearSlots()})})})
    takeInventory(url).then(r => {})
}

start()



















document.oncontextmenu = () => {
    return false;
}