(function(){
  if (!document.body.addEventListener || !document.body.setAttribute || !document.body.querySelector) {
    return
  }

  var options, encode, getPageAttributes, page, _Drop, target, drop, dropUl, placesMap, placesOrder, i, placesCount, addPlace, setUpPlaceLink;

  options = INSTALL_OPTIONS;
  encode = encodeURIComponent;

  getPageAttributes = function() {
    var page, el;

    page = {
      url: window.location.protocol + '//' + window.location.hostname + window.location.pathname,
      title: document.title,
      description: null,
      image: null
    }

    if (document.head) {
      el = document.head.querySelector('meta[name="description"][content], meta[name*="description"][content]');
      if (el) {
        page.description = el.getAttribute('content');
      }

      el = document.head.querySelector('meta[name="og:image"][content], meta[name*="image"][content]');
      if (el) {
        page.image = el.getAttribute('content');
      }
    }

    return page;
  };

  page = getPageAttributes();

  _Drop = Drop.createContext({
    classPrefix: 'eager-share-app'
  });

  target = document.createElement('a');
  target.className = 'eager-share-app-target';
  target.innerHTML = '<i class="eager-share-app-icon-share"></i><span>Share...</span>';

  document.body.appendChild(target);

  drop = new _Drop({
    target: target,
    classes: 'eager-share-app',
    openOn: 'click',
    position: 'bottom left',
    constrainToWindow: false,
    constrainToScrollParent: false,
    content: '<ul></ul>'
  });

  dropUl = drop.drop.querySelector('ul');

  placesMap = {
    twitter: {
      label: 'Twitter',
      href: 'https://twitter.com/home?status=' + encode(
        (page.description ? page.description + ' ' :
          (page.title ? page.title + ' ': '')
        ) +
        page.url
      )
    },
    facebook: {
      label: 'Facebook',
      href: 'https://facebook.com/sharer.php?u=' + encode(page.url)
    },
    google: {
      label: 'Google+',
      href: 'https://plus.google.com/share?url=' + encode(page.url)
    },
    pinterest: {
      label: 'Pinterest',
      href: '' +
        'http://pinterest.com/pin/create/button/' +
          '?url=' + encode(page.url) +
          (page.image ? '&media=' + encode(page.image) : '') +
          '&description=' + encode(page.description || page.title)
    },
    email: {
      label: 'Email',
      href: 'mailto:?subject=' + encode(page.title) + '&body=' + encode((page.description ? page.description + ' ' : '') +  page.url)
    }
  };

  placesOrder = [
    'twitter', 'facebook', 'google', 'pinterest', 'email'
  ];

  addPlace = function(place) {
    var li, a, text;

    li = document.createElement('li');
    a = document.createElement('a');

    a.className = 'eager-share-app-icon-' + place;
    a.setAttribute('href', placesMap[place].href);

    text = document.createTextNode(placesMap[place].label);
    a.appendChild(text);
    li.appendChild(a);

    if (place === 'email') {
      a.setAttribute('target', placesMap[place].target);
    } else {
      setUpPlaceLink(a);
    }

    dropUl.appendChild(li);
  };

  setUpPlaceLink = function(link) {
    link.addEventListener('click', function(event){
      var height, left, top, width, popupwindow, interval;
      event.preventDefault();
      width = 800;
      height = 500;
      left = (screen.width / 2) - (width / 2);
      top = (screen.height / 2) - (height / 2);
      popupwindow = window.open(link.getAttribute('href'), 'popupwindow', 'scrollbars=yes,width=' + width + ',height=' + height + ',top=' + top + ',left=' + left);
      popupwindow.focus();
      interval = setInterval(function(){
        try {
          if (popupwindow.closed) {
            drop.close();
            clearInterval(interval);
          }
        } catch (error) {}
      }, 100);
    });
  }

  placesCount = 0;

  for (i = 0; i < placesOrder.length; i++) {
    if (options.places[placesOrder[i]]) {
      addPlace(placesOrder[i]);
      placesCount += 1;
    }
  }

  target.setAttribute('eager-share-app-places-count', placesCount);
  drop.drop.setAttribute('eager-share-app-places-count', placesCount);

  // iOS :hover CSS hack
  target.addEventListener('touchstart', function(){}, false);
  drop.drop.addEventListener('touchstart', function(){}, false);
})();
