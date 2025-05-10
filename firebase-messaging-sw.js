self.addEventListener('push', function(event) {
    const data = event?.data?.json();
    const options = {
      body: data?.body,
      icon: '/favicon.png',
      badge: '/favicon.png',
      data: data?.data
    };
    event.waitUntil(
      self.registration.showNotification(data?.title, options)
    );
  });
  