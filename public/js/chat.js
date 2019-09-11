const socket = io()

//element
const $messageForm = document.querySelector('#messageForm')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')

const $sendlocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//template
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar_template').innerHTML

//Options
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix: true})
const autoscroll = () => {
    //new message element
    $newMessage = $messages.lastElementChild

    //height of the new message
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin 
    console.log(newMessageHeight)

    //visible height
    const  visibleHeight = $messages.offsetHeight

    //height of messages container
    const containerHeight = $messages.scrollHeight

    //how far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight
    
    if (containerHeight-newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message: message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(message) => {
    console.log(message)

    const html = Mustache.render(locationTemplate,{
        username : message.username,
        url: message.url,
        createdAt:moment(message.createdAt).format ('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({ room, users}) =>{
   const html = Mustache.render(sidebarTemplate,{
    room,   
    users
   })
   document.querySelector('#sidebar').innerHTML = html
   autoscroll()
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')

    const message = e.target.elements.message.value
    socket.emit('sendMessage',message,(remessage)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        console.log('Message Delivered!',remessage)
    })
})


$sendlocationButton.addEventListener('click',() =>{
    if (!navigator.geolocation){
        return alert('Geolocation is not supported for ur browser!')
    }
    
    $sendlocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            latitude : position.coords.latitude,
            longitude: position.coords.longitude
        },()=>{
            $sendlocationButton.removeAttribute('disabled')
            console.log('Location Shared!')
        })
    })

  
})

socket.emit('join',{ username, room} ,(error) => {
   if (error){
       alert(error)
        location.href = '/'
    }

})