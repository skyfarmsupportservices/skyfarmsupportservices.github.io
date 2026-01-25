// var CONFIG_URL="https://script.google.com/macros/s/AKfycbxI0pqn-npCAnLHoklN8F6HBkSAXC8LlvQWOcNmV2h6wewi19OBL3CAyeBUErA4JY4uKQ/exec";
// var CONFIG_URL = "https://script.google.com/macros/s/AKfycbxDRjvS7seRTC2w3zWEm5h1phOctIxqCq-DVS1bSLO-3iloXISN6MqX_vyyIDbAUNPjyg/exec";
// var CONFIG_URL = "https://script.google.com/macros/s/AKfycbxI0pqn-npCAnLHoklN8F6HBkSAXC8LlvQWOcNmV2h6wewi19OBL3CAyeBUErA4JY4uKQ/exec";

var DEBUG=false; 
var data = null;

let imageViewerInitialized = false;
let autoScroll;

$(document).ready(function(){
    initApp();
    // setLoading(false);
    getConfigData(); 
});

  function initApp(){
    var appData = data;
    if(data==null){
      appData =  getAppData();
    }
    var config = appData.config;
    var rating = appData.rating;
    var images = appData.images;

    initBackgroundImages(images);
    initFounders(images);
    initImageViewer(images);
    initActivities(images);
    
    $(".businessName").html(config.find(x=> x.key=='businessName').value);

    $(".heroVideoUrl").html(config.find(x => x.key == "heroVideoUrl").value);

    $("#messageFromCeoVideoSource").html(config.find(x=>x.key == "messageFromCeoVideoSource").value);
    initModalVideo();

    $(".brochureLink").attr("href",config.find(x => x.key == "brochureLink").value);
    
    $(".abn").html(config.find(x=> x.key=='abn').value);
    
    const info_email = config.find(x => x.key === 'info_email')?.value;
    $(".info_email").html(info_email);
    $(".info_email").attr("href", "mailto:" + info_email);

    const messageFromCeo = config.find(x => x.key === "messageFromCeo")?.value;
    $("#messageFromCeo").html(messageFromCeo);

    const jobs_email = config.find(x => x.key === 'jobs_email')?.value;
    $(".jobs_email").html(jobs_email);
    $(".jobs_email").attr("href", "mailto:" + jobs_email);

    const phone = config.find(x => x.key == "phone" ).value;
    $(".phone").html(phone);
    $(".phone").attr("href", "tel:" + phone);

    const address = config.find(x => x.key == ["address"]).value ?? [];
    const addressDiv = address.map(a => `<div class="text-white">${a}</div>`);
    const addressJoined = address
      .map(a => a.replace(/\s+/g,"+"))
      .join("+");
    $(".address").html(addressDiv);
    $(".direction").attr("href", `https://www.google.com/maps/dir//${addressJoined}/`)

    $(".openingHours").html(config.find(x => x.key == "openingHours").value);

    const socialLinks = config.filter(x => ['facebook','instagram','youtube'].includes(x.key) && x.value!=null);
    var socialIcons = socialLinks.map(x => 
      `<li class="social-icon-item me-2">
        <a href="${x.value}" target="_blank" class="social-icon-link bi-${x.key}"></a>
      </li>`);  
    
    $(".socialIcons").html(socialIcons);
                          
    //ratings

    initTestimonials(rating);
    initContactForm();
    initMenuNav();
  }

  function initModalVideo(){ 

    function playVideo() {
      const iframe = $('#patrick_interview');
      const src = iframe.data('src');
      iframe.attr('src', src);
    }

    function stopVideo() {
      const iframe = $('#patrick_interview');
      iframe.attr('src', '');
    }

    function closeModal() {
      $('#videoModal').fadeOut(function () {
        $('#videoModal').removeClass('show');
        stopVideo(); // STOP Drive video
      });
    }

    $('#openModal').on('click', function () {
      $('#videoModal').addClass('show').fadeIn();
      playVideo(); // ▶️ AUTOPLAY Drive video
    });

    $('.close').on('click', function (e) {
      e.stopPropagation();
      closeModal();
    });

    // Outside click
    $('#videoModal').on('click', function (e) {
      if ($(e.target).is('#videoModal')) {
        closeModal();
      }
    });

    // ESC key support
    $(document).on('keydown', function (e) {
      if (e.key === 'Escape') {
        closeModal();
      }
    });
  }

  function initMenuNav(){
    $('.navbar-collapse a').on('click',function(){
      $(".navbar-collapse").collapse('hide');
    });
 
    $('.smoothscroll').click(function(){
      var el = $(this).attr('href');
      var elWrapped = $(el);
      var header_height = $('.navbar').height();
  
      scrollToDiv(elWrapped,header_height);
      return false;
  
      function scrollToDiv(element,navheight){
        var offset = element.offset();
        var offsetTop = offset.top;
        var totalScroll = offsetTop-navheight;
  
        $('body,html').animate({
        scrollTop: totalScroll
        }, 300);
      }
    });
  }

  function initBackgroundImages(images){
    $("#section_home").css("background-image",`url('${images.hero[0].url}')`);
    $(".valuesandmission").css("background-image",`url('${images.about[0].url}')`);
  }

  function initFounders(images){ 
    var imageList = images.profile.filter(x=>x.active=="y");       
    var founderDiv =  imageList.map(p=>
      `<div class="col-lg-6 col-md-12 member-block">
          <div class="member-block-image-wrap">
            <img src="${p.url}" class="member-block-image img-fluid" alt="">
          </div>
          <div class="member-block-info d-flex align-items-center">
            <h4>${p.title ?? ""}</h4>
            <p class="ms-auto">${p.subTitle ?? ""}</p>
          </div>
        </div>
      `
    );
    $("#founder_div").html(founderDiv);
  }

function initImageViewer(images) {

  images = images.sil.filter(x => x.active === 'y');

  const track = document.getElementById("track");
  const indicators = document.getElementById("indicators");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const prevBtn = document.querySelector(".slider.prev");
  const nextBtn = document.querySelector(".slider.next");

  clearInterval(autoScroll);
  track.innerHTML = "";
  indicators.innerHTML = "";

  let index = 0;
  let isPlaying = true;

  /* Load images & dots */
  images.forEach((image, i) => {
    const img = document.createElement("img");
    img.src = image.url;
    img.draggable = false; // prevents ghost drag
    track.appendChild(img);

    // indicator dots
    const dot = document.createElement("span");
    dot.classList.add("dot");

    dot.addEventListener("click", () => {
      index = i;
      updateCarousel();
      resetAutoScroll();
    });

    indicators.appendChild(dot);

  });

  function updateCarousel() {
    if (!track.children.length) return;

    const width = track.children[0].getBoundingClientRect().width;
    track.style.transform = `translateX(-${index * width}px)`;

    [...indicators.children].forEach(dot =>
      dot.classList.remove("active")
    );
    indicators.children[index].classList.add("active");
    // slider
    $(".slider-counter").html(`${(index+1)}/${images.length}`);
  }

  function startAutoScroll() {
    clearInterval(autoScroll);
    autoScroll = setInterval(() => {
      index = (index + 1) % images.length;
      updateCarousel();
    }, 3000);
  }

  function stopAutoScroll() {
    clearInterval(autoScroll);
  }

  function resetAutoScroll() {
    stopAutoScroll();
    if (isPlaying) startAutoScroll();
  }

  /* ▶ ⏸ Play / Pause */
  playPauseBtn.addEventListener("click", () => {
    isPlaying = !isPlaying;

    if (isPlaying) {
      startAutoScroll();
      playPauseBtn.classList.add("pause");
      playPauseBtn.classList.remove("play");
    } else {
      stopAutoScroll();
      playPauseBtn.classList.add("play");
      playPauseBtn.classList.remove("pause");
    }
  });

  /* ❮ Prev */
  prevBtn.addEventListener("click", () => {
    index = (index - 1 + images.length) % images.length;
    updateCarousel();
    resetAutoScroll();
  });

  /* ❯ Next */
  nextBtn.addEventListener("click", () => {
    index = (index + 1) % images.length;
    updateCarousel();
    resetAutoScroll();
  });

  /* 📱 TOUCH / SWIPE SUPPORT */
  let startX = 0;
  let endX = 0;

  track.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener("touchmove", e => {
    endX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener("touchend", () => {
    const diff = startX - endX;

    if (Math.abs(diff) > 50) { // swipe threshold
      if (diff > 0) {
        // swipe left → next
        index = (index + 1) % images.length;
      } else {
        // swipe right → prev
        index = (index - 1 + images.length) % images.length;
      }
      updateCarousel();
      resetAutoScroll();
    }

    startX = endX = 0;
  });

  updateCarousel();
  startAutoScroll();

  imageViewerInitialized = true;
}



  function initActivities(images){
    var activitiesDiv = images.activities.filter(x=>x.active=="y").map(p=>
    `<div class="col-12 col-md-6 col-lg-4 p-3">
        <div class="activity">
            <div class="activity-block rounded">
                <div class="custom-block-image-wrap">
                    <img src="${p.url}" class="custom-block-image img-fluid" alt="">
                </div>
                <div class="events-title mt-3">${p.title ?? ""}</div>
                <p>${p.subTitle  ?? ""}</p>
            </div>
        </div>                                
      </div>
    `);
    $("#activities_container").html(activitiesDiv);
  }

  //TESTIMONIALS
  async function initTestimonials(rating){
    if(!rating){
      rating=[];
    }
    var template = `
      <div class="testimonial-card card position-absolute w-100 rounded p-5  mx-auto active border-0 scroll-hidden">
        <div class="">
            <h4>*name*</h4>
            
        </div>
        <div class="d-flex flex-row justify-content-between align-items-center">
          <div class="d-flex flex-row py-3">
              *stars*
          </div>
          <span class="text-muted">*date*</span>
        </div>
        <p class="p-2">*comment*</p>
    </div>
    `;
    
    function getStarIcons(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) {
                stars += `<i class="bi bi-star-fill ms-1 text-warning"></i>`;
            } else if (i - rating <= 0.5) {
                stars += `<i class="bi bi-star-half ms-1 text-warning"></i>`;
            } else {
                stars += `<i class="bi bi-star ms-1 text-warning"></i>`;
            }
        }
        return stars;
    }
    var testimonialDiv="";
    rating.forEach(item => {
        let card = template
            .replace("*name*", item.name)
            .replace("*date*", item.date)
            .replace("*comment*", item.comment)
            .replace("*stars*", getStarIcons(item.rating));

        testimonialDiv += card;
    });
    $("#testimonial-slider").html(testimonialDiv);
    if(rating.length<2){
      $("#testimonial-slider-button").addClass("d-none");
    }else{
      toggleTestimonial();
    }
  }

  //TESTIMONIAL TOGGLE
  function toggleTestimonial(){
    const $cards = $('.testimonial-card');
        let currentIndex = 0;

        function goToCard(newIndex, direction) {
            if (newIndex === currentIndex) return;

            const $current = $cards.eq(currentIndex);
            const $next = $cards.eq(newIndex);

            // Reset any previous animation classes
            $cards.removeClass('slide-left slide-right');

            // Position the new card off-screen in the correct direction
            if (direction === 'next') {
                $next.css({ left: '100%' }).addClass('active').show();
                $current.animate({ left: '-100%' }, 500);
                $next.animate({ left: '0%' }, 500);
            } else {
                $next.css({ left: '-100%' }).addClass('active').show();
                $current.animate({ left: '100%' }, 500);
                $next.animate({ left: '0%' }, 500);
            }

            // After animation, reset z-index and cleanup
            setTimeout(() => {
                $current.removeClass('active').css({ left: '100%' });
                currentIndex = newIndex;
            }, 500);
        }

        $('#nextBtn').click(() => {
            const nextIndex = (currentIndex + 1) % $cards.length;
            goToCard(nextIndex, 'next');
        });

        $('#prevBtn').click(() => {
            const prevIndex = (currentIndex - 1 + $cards.length) % $cards.length;
            goToCard(prevIndex, 'prev');
        });

        let startX = 0;
        $('#testimonial-slider').on('touchstart', function (e) {
            startX = e.originalEvent.touches[0].clientX;
        });

        $('#testimonial-slider').on('touchend', function (e) {
            const endX = e.originalEvent.changedTouches[0].clientX;
            const diff = startX - endX;

            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    // Swipe Left → next
                    const nextIndex = (currentIndex + 1) % $cards.length;
                    goToCard(nextIndex, 'next');
                } else {
                    // Swipe Right → previous
                    const prevIndex = (currentIndex - 1 + $cards.length) % $cards.length;
                    goToCard(prevIndex, 'prev');
                }
            }
        });

        // Init: show only the first card
        $cards.css({ left: '100%' }).hide();
        $cards.eq(currentIndex).css({ left: '0%' }).addClass('active').show();
  }

  //CONTACT FORM
  function initContactForm(){
    clearForm();
    hideLoader();
    clearContactError();
  }

  $("#submit_contact_form").click(function(e){
    clearContactError();
    e.preventDefault();
    var formData = {};
    $.each($("#contact-form").serializeArray(), function(_, field) {
        formData[field.name] = decodeURIComponent(field.value.replace(/\+/g, " "));
    });
    var hasEmpty = false;
    $.each(formData, function(key, value) {
        if (value === null || value === undefined || value.trim() === "") {
            hasEmpty = true;
            return false;
        }
    });
    if(hasEmpty){
      showContactError();
      return;
    }
    clearContactError();
    var formObjAppended = $.map(formData, function(value, key) {
        return encodeURIComponent(key) + "=" + encodeURIComponent(value);
    }).join("&");
    
    sendData(formObjAppended, DEBUG);

  });

  function clearContactError(){
    $("#submit_form_error").addClass("d-none");
  }

  function showContactError(){
    $("#submit_form_error").removeClass("d-none");
  }

  function showLoader(){      
    $("#loadingDots").removeClass("d-none");
  }

  function hideLoader(){
    $("#loadingDots").addClass("d-none");
  }

  function showSubmitButton(){
    $("#submit_contact_form").removeClass("d-none");      
  }

  function hideSubmitButton(){
    $("#submit_contact_form").addClass("d-none");
  }

  function clearForm(){
    $("#contact-form").find("input, textarea, select").val("");
  }

  function sendData(formDataString, debug){
      if(debug){
          showLoader();
          hideSubmitButton();
            
          setTimeout(() => {
            clearForm();
            hideLoader();
            showSubmitButton();
            showFailure();
          }, 2000);
          return;
      }
      showLoader();
      hideSubmitButton();
      fetch(`${CONFIG_URL}?route=contact`, 
          {
              method : "POST",
              body : formDataString,
              headers : {
                  "Content-Type" : "application/x-www-form-urlencoded"
              }
          }
      ).then(function(response){
          if(response){
              return response;
          }
          else{
              showFailure();
          }
      }).then(function (response){
        clearForm();
        hideLoader();
        showSubmitButton();
          if(response.status == 200){
              showSuccess();
          }
          else{
              showFailure();
          }
      });
  }

  function showSuccess(){
    setTimeout(() => {
      hideSuccess();
    }, 5000);
      $("#submit_form_post_success").html("Thank you. Your response has been received. A confirmation email has been sent to your specified email. (If you don’t see it within an hour, please check your <strong>spam</strong> folder.)");
  }

  function hideSuccess(){
      $("#submit_form_post_success").html("");
  }

  function showFailure(){
    setTimeout(() => {
      hideFailure();
    }, 5000);
      $("#submit_form_post_error").html("Something went wrong. Please contact the administrator.");
  }

  function hideFailure(){
    $("#submit_form_post_error").html("");
  }


  async function getConfigData(){
    try {
      setLoading(true);
      const response = await fetch(`${CONFIG_URL}?route=data`);
      const json = await response.json();
      if (json && json.data){
        data = json.data;
      } 
      else {
        console.warn('No valid data found in response.'); 
      }
    } 
    catch (err) {
      console.error('Fetch failed:', err);
    }
    finally{
      setLoading(false);
    }
    initApp();
      
  }

  function setLoading(loading){
    if(loading){
      $(".loading-holder").show();
      return;
    }
    $(".loading-holder").hide();
  }

  $(".share-external").click(function(e) {
    e.preventDefault();
    
    if (navigator.share) {
      navigator.share({
        title: document.title,
        text: "Check out this website!",
        url: window.location.href
      }).catch(function (error) {
      });
      } else { }
  });


function getAppData(){
  return appData;
}

const appData = {
    "config": [
        {
            "key":"businessName",
            "value":"Sky Farm Support Services"
        },
        {
            "key": "primary_email",
            "value": "skyfarm.s.services@gmail.com"
        },
        {
            "key": "noreply_email",
            "value": "skyfarm.s.services@gmail.com"
        },
        {
            "key": "info_email",
            "value": "info@skyfarmsupportservices.com"
        },
        {
            "key": "jobs_email",
            "value": "jobs@skyfarmsupportservices.com"
        },
        {
            "key": "admin_email",
            "value": "skyfarm.s.services@gmail.com"
        },
        {
            "key": "phone",
            "value": "0408954198"
        },
        {
            "key": "jobs_phone",
            "value": "0408954198"
        },
        {
            "key": "address",
            "value": [
                "20 Carillion Ct",
                "Newnham, 7248",                
                "Tasmania, Australia"
            ]
        },
        {
            "key": "abn",
            "value": "99 896 435 705"
        },
        {
            "key": "openingHours",
            "value": "Mon-Fri &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;8:00 AM - 5:00 PM"
        },        
        {
            "key": "facebook",
            "value": "https://www.facebook.com/skyfarmsupportservices"
        },
        {
            "key":"heroVideoUrl",
            "value":"<iframe id='introVideo' src='https://drive.google.com/file/d/1ktPYn_HaQKawJjfk9Q7iZZb_GzLmBtJC/preview' width='100%' allow='autoplay' allowfullscreen style='border:none;'></iframe>"
        },
        {
            "key":"messageFromCeo",
            "value":"<div class='card border-0 shadow-lg p-5 rounded-4'><p class='text-center'>At Sky Farm Support Services, we believe that supporting people with disability is more than just a service—it’s a commitment to respect, dignity, and empowerment. Every team member here plays a vital role in creating meaningful experiences and making a real difference in people’s lives.<br>We’re looking for compassionate, dedicated, and curious individuals who want to grow with us, learn from each other, and help build a community where everyone can thrive. If you’re seeking a workplace where your ideas matter, your kindness is valued, and your work changes lives daily, you’ve come to the right place.<br>Thank you for considering joining our journey. Together, we can make a difference that truly matters.</p><br><p class='text-end'>- CEO, Sky Farm Support Services</p></div><br><br>"
        },
        {
            "key":"messageFromCeoVideoSource",
            "value": `<span class="close">&times;</span>
                      <div class="video-wrapper">
                        <iframe
                          id="patrick_interview"
                          data-src="https://drive.google.com/file/d/1vmzuepf4Jod08GFvFy5-XIgZ5Pfnk12z/preview"
                          allow="autoplay"
                          height="100%"
                          allowfullscreen
                          style="border:none;">
                        </iframe>
                      </div>
                    `                    
        },
        {
            "key":"brochureLink",
            "value" : "https://drive.google.com/file/d/1HWZj9F4lNTY1XhgNc25hUuxUVDgcE56r/view"
        }
    ],
    "career": [],
    "rating": [
        {
            "name": "Grace",
            "comment": "Thank you Patrick and team for making our lives easy.",
            "rating": 4.5,
            "date": "2025-01-01",
            "active": "Y"
        },
        {
            "name": "Helen",
            "comment": "Very reliable and caring team. Good support.",
            "rating": 5,
            "date": "2024-01-01",
            "active": "y"
        }
    ],
    "images":{
        "hero":[
            {
                "url":"images/hero-background.jpg",
                "title":"",
                "subTitle":"",
                "active":"y"
            }
        ],
        "profile":[
            {
                "url":"images/patrick_profile.jpg",
                "title":"Patrick",
                "subTitle":"Founder",
                "active":"y"
            },
            {
                "url":"images/lauren_profile.jpg",
                "title":"Lauren",
                "subTitle":"CEO",
                "active":"n"
            },
        ],
        "about":[
            {
                "url":"images/valuesandmission.jpg",
                "title":"",
                "subTitle":"",
                "active":"y"
            }
        ],
        "sil":[
            {
                "url": "images/SIL_01.jpg",
                "title": "SIL House 01",
                "subTitle": "SIL",
                "active":"y"
            },
            {
                "url": "images/SIL_02.jpg",
                "title": "SIL House 02",
                "subTitle": "SIL",
                "active":"y"
            },
            {
                "url": "images/SIL_03.jpg",
                "title": "SIL House 03",
                "subTitle": "SIL",
                "active":"y"
            },
            {
                "url": "images/SIL_04.jpg",
                "title": "SIL House 04",
                "subTitle": "SIL",
                "active":"y"
            },
            {
                "url": "images/SIL_05.jpg",
                "title": "SIL House 05",
                "subTitle": "SIL",
                "active":"y"
            },
            {
                "url": "images/SIL_06.jpg",
                "title": "SIL House 06",
                "subTitle": "SIL",
                "active":"y"
            },
            {
                "url": "images/SIL_07.jpg",
                "title": "SIL House 07",
                "subTitle": "SIL",
                "active":"y"
            },
            {
                "url": "images/SIL_08.jpg",
                "title": "SIL House 08",
                "subTitle": "SIL",
                "active":"y"
            },
            {
                "url": "images/SIL_09.jpg",
                "title": "SIL House 09",
                "subTitle": "SIL",
                "active":"y"
            },
            {
                "url": "images/SIL_10.jpg",
                "title": "SIL House 10",
                "subTitle": "SIL",
                "active":"y"
            },
            {
                "url": "images/SIL_11.jpg",
                "title": "SIL House 11",
                "subTitle": "SIL",
                "active":"y"
            },
            {
                "url": "images/SIL_12.jpg",
                "title": "SIL House 12",
                "subTitle": "SIL",
                "active":"y"
            },
            {
                "url": "images/SIL_13.jpg",
                "title": "SIL House 13",
                "subTitle": "SIL",
                "active":"y"
            },
            {
                "url": "images/SIL_14.jpg",
                "title": "SIL House 14",
                "subTitle": "SIL",
                "active":"y"
            },
            {
                "url": "images/SIL_15.jpg",
                "title": "SIL House 15",
                "subTitle": "SIL",
                "active":"y"
            },
            {
                "url": "images/SIL_16.jpg",
                "title": "SIL House 16",
                "subTitle": "SIL",
                "active":"y"
            },
            {
                "url": "images/SIL_17.jpg",
                "title": "SIL House 17",
                "subTitle": "SIL",
                "active":"y"
            }
        ],
        "activities":[
            {
                "url":"images/activity_gardening.jpg",
                "title":"Veggie Gardening",
                "subTitle":"Grow fresh veggies and savour the goodness of your own garden, totally a backyard organic gardening experience.",
                "active":"y"
            },
            {
                "url":"images/activity_chicken.jpg",
                "title":"Egg Laying Production",
                "subTitle":"Witness the wonder of life with our feathered friends, feed them and collect your morning eggs for breakkie.",
                "active":"y"
            },
            {
                "url":"images/activity_animals.jpg",
                "title":"Farm animal experience",
                "subTitle":"Experience the rhythm of farm life, one gentle squeeze at a time. Occasional horse, donkey, dog playtime and milking of cows.",
                "active":"y"
            },
            {
                "url":"images/activity_fishing_1.jpg",
                "title":"Fishing",
                "subTitle":"Cast a line into the serene waters and reel in more than just fish.",
                "active":"y"
            },
            {
                "url":"images/activity_woodworking.jpg",
                "title":"Woodworking",
                "subTitle":"Craft your skills and create tangible memories.",
                "active":"y"
            },
            {
                "url":"images/activity_building.jpg",
                "title":"Hands-On Skill Building",
                "subTitle":"Gain practical skills through hands-on projects : from setting up garden spaces to small construction tasks.",
                "active":"y"
            }
        ]

    }
}







