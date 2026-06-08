(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var forms = document.querySelectorAll('form[action*="formsubmit.co"]');
    forms.forEach(function (form) {
      form.addEventListener(
        "submit",
        function (e) {
          e.preventDefault();
          e.stopImmediatePropagation();
          var submitBtn = form.querySelector('input[type="submit"]');
          var originalValue = submitBtn ? submitBtn.value : "";
          if (submitBtn) {
            submitBtn.value = submitBtn.getAttribute("data-wait") || "Please wait...";
            submitBtn.disabled = true;
          }
          var formData = new FormData(form);
          fetch(form.action, { method: "POST", body: formData, headers: { Accept: "application/json" } })
            .then(function (r) { return r.json(); })
            .then(function (data) {
              if (data.success) {
                form.style.display = "none";
                var done = form.parentElement.querySelector(".w-form-done");
                if (done) done.style.display = "block";
              } else {
                var fail = form.parentElement.querySelector(".w-form-fail");
                if (fail) fail.style.display = "block";
              }
            })
            .catch(function () {
              var fail = form.parentElement.querySelector(".w-form-fail");
              if (fail) fail.style.display = "block";
            })
            .finally(function () {
              if (submitBtn) {
                submitBtn.value = originalValue;
                submitBtn.disabled = false;
              }
            });
        },
        true
      );
    });
  });
})();
