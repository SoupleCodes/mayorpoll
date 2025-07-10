// https://jsfiddle.net/sUK45/
var stringToColour = function(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = '#';
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF;
        colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
}


const root = 'https://api.darflen.com/posts/8a0762bd1e880162a58d7d2d'
let users = []
let content = fetch(root)
    .then(response => response.json())
    .then(post => {
        console.log(post)
        content = post.post.content

        users = []
        const regex = /^[a-zA-Z0-9]+(?:\r?\n|$)/gm;
        const matches = content.matchAll(regex);

        for (const match of matches) {
            let username = match[0].trim()
            users.push(username);
        }

        console.log(users);
    })

let votes = {}
let allVotesCount = 0
let comments = fetch(root + '/comments')
    .then(response => response.json())
    .then(comments => {
        let allComments = comments.comments
        console.log(allComments)

        allComments.map((comments) => {
            let commentContent = comments.content

            let votedWho = commentContent.split(" ")[0]
            let voteCount
            let usersVoted = []
            if (users.includes(votedWho) && votedWho !== comments.author.profile.username && !(votes[votedWho] && (votes[votedWho].users).includes(comments.author.profile.username))) {
                if(votes[votedWho]) {
                    voteCount = votes[votedWho].count + 1
                    usersVoted = votes[votedWho].users
                } else {
                    voteCount = 1
                }
                allVotesCount++
                usersVoted.push(comments.author.profile.username)
                votes[votedWho] = {
                    count: voteCount,
                    users: usersVoted
                }
            }
        })

        for (const vote of Object.entries(votes)) {
            makeBar(vote[0], vote[1].count, vote[1].users)
        }

    })

function makeBar(voteName, voteCount, usersWhoVoted) {
    console.log(voteName, voteCount, usersWhoVoted)

    const choice = document.createElement("div")
    choice.setAttribute("class", "choice")
    
    const label = document.createElement("span")
    label.textContent = voteName
    label.setAttribute("class", "label")

    const percentage = document.createElement("span")
    percentage.textContent = `${Math.floor((voteCount / allVotesCount) * 100)*100 /100}%`
    percentage.setAttribute("class", "percentage")

    const barGroup = document.createElement("div")
    barGroup.setAttribute("class", "bar-group")

    const bar = document.createElement("div")
    bar.setAttribute("class", "bar")
    bar.setAttribute("title", usersWhoVoted.join(", "))
    bar.style.backgroundColor = stringToColour(voteName)

    const votesCount = document.createElement("p")
    votesCount.textContent = voteCount + " votes"
    votesCount.setAttribute("class", "votesCount")

    const fill = document.createElement("div")
    fill.setAttribute("class", "fill")

    choice.appendChild(label)
    choice.appendChild(percentage)
    barGroup.appendChild(fill)
    barGroup.appendChild(bar)
    bar.appendChild(votesCount)
    choice.appendChild(barGroup)

    document.getElementById("choices").appendChild(choice)
    setTimeout(() => {
        bar.style.width = `${(voteCount / allVotesCount) * 100}%`
        fill.style.width = '100%'
    }, 10);
}