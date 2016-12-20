var $$ = function(id) {
    return document.getElementById(id);
};
var in_game = false
var xhr = new XMLHttpRequest();
xhr.open('GET', 'image_names.txt', false);
xhr.send(null);
var urls = xhr.responseText.split('\n')
$$("item").src = (urls[Math.floor(Math.random() * urls.length)])
showInfo('info_start');
var create_email = false;
var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;
if (!('webkitSpeechRecognition' in window)) {
    upgrade();
} else {
    start_button.style.display = 'inline-block';
    var recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = function() {
        recognizing = true;
        showInfo('info_speak_now');
        start_img.src = 'mic-animate.gif';
    };

    recognition.onerror = function(event) {
        if (event.error == 'no-speech') {
            start_img.src = 'mic.gif';
            showInfo('info_no_speech');
            ignore_onend = true;
        }
        if (event.error == 'audio-capture') {
            start_img.src = 'mic.gif';
            showInfo('info_no_microphone');
            ignore_onend = true;
        }
        if (event.error == 'not-allowed') {
            if (event.timeStamp - start_timestamp < 100) {
                showInfo('info_blocked');
            } else {
                showInfo('info_denied');
            }
            ignore_onend = true;
        }
    };

    recognition.onend = function() {
        if (ignore_onend) {
            return;
        }
        start_img.src = 'mic.gif';
        if (!final_transcript) {
            showInfo('info_start');
            return;
        }
        recognition.start()
    };

    recognition.onresult = function(event) {
        var prev = ""
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
                prev = event.results[i][0].transcript;
            }
        }
        if (final_transcript.length > 0) {
            var voiceInput = final_transcript.toLowerCase().replace("-", " ")
            var element = $$("item").src
            var end = element.lastIndexOf("_")
            var start = element.lastIndexOf("/") + 1
            element = element.substring(start, end).toLowerCase()
            element = element.replace("_", " ")
            console.log("Hint: correct answer is " + element)
            $$("userInput").textContent = "I think you said... " + prev
            if (checkEqual(voiceInput, element, prev)) {
                $$("item").src = urls[Math.floor(Math.random() * urls.length)]
                $$("score").textContent = parseInt($$("score").textContent) + 1;
            }
        }
    };
}

function checkEqual(s1, s2, s3) {
    return s2.includes(s3) || s1.includes(s2) || s1.includes(s2 + "s") || s1.includes(s2 + "es") ||
        s1.includes(s2.substring(0, s2.length - 1) || s1.includes(s2.substring(0, s2.length - 2)))
}

function upgrade() {
    start_button.style.visibility = 'hidden';
    showInfo('info_upgrade');
}

function startButton(event) {
    if (in_game) {
        $$("item").src = urls[Math.floor(Math.random() * urls.length)]
        return;
    }
    if (recognizing) {
        recognition.stop();
        return;
    }
    $$("play").textContent = "Skip!"
    $("#myModal").modal("hide");
    final_transcript = '';
    recognition.start();
    ignore_onend = false;
    start_img.src = 'mic-slash.gif';
    showInfo('info_allow');
    showButtons('none');
    start_timestamp = event.timeStamp;
    startTimer(60, time)
    in_game = true
}

function showInfo(s) {
    if (s) {
        for (var child = info.firstChild; child; child = child.nextSibling) {
            if (child.style) {
                child.style.display = child.id == s ? 'inline' : 'none';
            }
        }
        info.style.visibility = 'visible';
    } else {
        info.style.visibility = 'hidden';
    }
}
var current_style;

function showButtons(style) {
    if (style == current_style) {
        return;
    }
    current_style = style;
}

function startTimer(duration, display) {
    var timer = duration,
        minutes, seconds;
    var interval = setInterval(function() {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);
        seconds = seconds < 10 ? "0" + seconds : seconds;
        display.textContent = minutes + ":" + seconds;
        if (--timer < 0) {
            timer = duration;
        }
        if (minutes == 0 && seconds == 0) {
            clearInterval(interval);
            start_img.src = 'mic.gif'
            $("#myModal").modal("show");
            display.textContent = "1:00"
            var resultScore = $$("score").textContent
            $$("score").textContent = 0
            $$("points").textContent = resultScore
            $$("play").textContent = "Play!"
            in_game = false
            recognizing = false
            var highscore = $$("highscore").textContent
            $$("highscore").textContent = Math.max(highscore, resultScore)
        }
    }, 1000);
}