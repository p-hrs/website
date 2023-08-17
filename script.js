
/* SECTION BACKGROUND COLOURS */
const $window = $(window);
const $sections = $('.section');

const $has_background = $("body, .section, .menu-button-container, .parallax-wrapper");

window.addEventListener("scroll", updateBackground);

function updateBackground() {
    var scroll = $window.scrollTop() + ($window.height() / 3);

    $sections.each(function () {
        var $this = $(this);
        
        if ($this.position().top <= scroll && $this.position().top + $this.height() > scroll) {
            const new_color = $this.data('col')
            $has_background.css("background-color", new_color);
        }
    })
};    


/* PARALLAX ELEMENTS */

/* Parallax Text Overlays */
const $main_titles = $(".parallax-main");
const $clone_titles = {};
const scroll_speeds = {};

$main_titles.each(function() {
    const id = $(this).attr("id");
    const html = $(this).html()
    
    const $clones = $(".parallax-overlay#" + id);
    $clones.html(html);

    $clone_titles[id] = $clones;

    const scroll_speed = $(this).data('scrollspeed');
    scroll_speeds[id] = scroll_speed;
});



window.addEventListener("load", setPos);
window.addEventListener("resize", setPos);
window.addEventListener("scroll", updatePos);

function setPos() {
    $main_titles.each(function() {
        const $main_title = $(this);
        const { 
            x: main_title_x, 
            y: main_title_y 
            } = $main_title[0].getBoundingClientRect();
        
        const id = $main_title.attr("id");
        const $clones =  $clone_titles[id];
        const scroll_speed = scroll_speeds[id];

        $clones.each(function(){
            const $this = $(this); 
            const wrapper = $this.parent()[0]
            const {
                x: wrapper_x,
                y: wrapper_y
                } = wrapper.getBoundingClientRect();

            $this.css("top", `${main_title_y - wrapper_y}px`);
            $this.css("left", `${main_title_x - wrapper_x}px`);
            
            $this.fadeIn(1000);
        })
    })
}

function getOffset(scroll_speed) {
    return window.pageYOffset * scroll_speed;
}

function updatePos() {
    $main_titles.each(function() {
        const id = $(this).attr("id");
        const $clones =  $clone_titles[id];
        const scroll_speed = scroll_speeds[id];

        const new_y = `translateY(${getOffset(scroll_speed)}px)`;
        
        $(this).css("transform", new_y);
        $clones.css("transform", new_y);
    })
}


/* PAGE TRAVERSAL */
const $menu_buttons = $(".menu-button-container button, .top-arrow");

$menu_buttons.each(function() {
    const id = $(this).attr("id");
    const color = $(".section#" + id).data('col');
    $(this).css("color", color);
    if (id == "top") {
        $(this).css("border-color", color);
    }

    $(this).fadeIn(1000);
})

const $menu = $(".menu-button-container");

window.addEventListener("load", scrollMenu);
window.addEventListener("resize", scrollMenu);
window.addEventListener("scroll", scrollMenu);

function scrollMenu() {
    const screen_height = window.innerHeight;

    var offset = getOffset(0.4);
    offset = Math.min(offset, screen_height * 0.85);

    const new_y = `translate(-50%, ${-offset}px)`;

    $menu.css("transform", new_y);
}

$menu_buttons.click(function() {
    const section = $(this).attr("id");
    goTo(section);
})

function goTo(section) {
    if (section != "contactme") {
        $(".section#" + section)[0].scrollIntoView({behavior: "smooth"});
    } else {
        $(".footer")[0].scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
}


/* PORTFOLIO SECTION */
const $projects = $(".project");

window.addEventListener("load", createPaths);
window.addEventListener("resize", setPaths);

function createPaths () {
    $projects.each(function() {
        const $project = $(this);
        const $images = $project.find("img");

        var paths_html = `<svg class="connectors">`

        var count = 0;
        $images.each(function() {
            const image = $(this)[0];

            image.setAttribute('onmouseover', "hoverImages(this)");
            image.setAttribute('onmouseout', "normalImages(this)");

            const id = "img" + count.toString();

            image.id = id;
            const new_path = `<path id="` + id + `"/>`;

            paths_html += new_path;

            count += 1;
        })

        paths_html += `</svg>`

        if (count > 0) {
            $project[0].innerHTML += paths_html;
        }
    })

    setPaths();
}

function setPaths () {
    $projects.each(function() {
        const $project = $(this);
        const $paths = $project.find(".connectors path");
        const text_box = $project.find(".text-box")[0];

        const project_dim = $project[0].getBoundingClientRect();
        const text_box_dim = text_box.getBoundingClientRect();
        const text_box_x = text_box_dim.left + text_box_dim.width/2 - project_dim.left;
        const text_box_y = text_box_dim.top + text_box_dim.height/2 - project_dim.top;

        const curve = 140;///make proportional
        
        $paths.each(function () {
            const path = $(this)[0];
            const id = path.id;
            const image = $project.find("img#" + id)[0];

            const image_dim = image.getBoundingClientRect();
            const image_x = image_dim.left + image_dim.width/2 - project_dim.left;
            const image_y = image_dim.top + image_dim.height/2 - project_dim.top;
            
            const width = (image_x - text_box_x);
            const height = (image_y - text_box_y);
            const length = Math.sqrt( width*width + height*height );
            
            const p0 = text_box_x + " " + text_box_y;
            const p1 = (text_box_x + width/3) + " " + (text_box_y + height/3);
            const p2 = (text_box_x + 2*width/3) + " " + (text_box_y + 2*height/3);
            const p3 = (text_box_x + width) + " " + (text_box_y + height);
            const q = (text_box_x + (width/2 - curve*height/length) / 3)  + " " + 
                      (text_box_y + (height/2 + curve*width/length) / 3);
            
            const path_d = `M ${p0} Q ${q} ${p1} T ${p2} T ${p3}`;

            path.setAttribute('d', path_d);
            path.style.strokeDasharray = `${length/30},${length/30}`;
            path.style.strokeDashoffset = length;
        })
    })
}

function hoverImages(element) {
    const $siblings = $(element).siblings().addBack();
    $siblings.addClass("hovered");
}

function normalImages(element) {
    const $siblings = $(element).siblings().addBack();
    $siblings.removeClass("hovered");
}


/* CONTACTME SECTION */

function buttonAnimation (element) {
    $element = $(element);
    $element.addClass("clicked");

    const duration = window.getComputedStyle($element[0]).transitionDuration;
    var click_length = parseFloat(duration);

    if (duration.slice(-1) === "s" && duration.slice(-2, -1) !== "m") {
        click_length = click_length * 1000;
    }
    
    console.log(click_length);
    setTimeout(function() {
        $element.removeClass("clicked");
    }, click_length);
    
}
