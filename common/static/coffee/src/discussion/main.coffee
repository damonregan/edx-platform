if Backbone?
  DiscussionApp =
    start: (elem)->
      # TODO: Perhaps eliminate usage of global variables when possible
      DiscussionUtil.loadRolesFromContainer()
      element = $(elem)
      window.$$course_id = element.data("course-id")
      user_info = element.data("user-info")
      sort_preference = element.data("sort-preference")
      threads = element.data("threads")
      thread_pages = element.data("thread-pages")
      content_info = element.data("content-info")
      window.user = new DiscussionUser(user_info)
      Content.loadContentInfos(content_info)
      discussion = new Discussion(threads, {pages: thread_pages, sort: sort_preference})
      new DiscussionRouter({discussion: discussion})
      Backbone.history.start({pushState: true, root: "/courses/#{$$course_id}/discussion/forum/"})
  DiscussionProfileApp =
    start: (elem) ->
      element = $(elem)
      window.$$course_id = element.data("course-id")
      threads = element.data("threads")
      user_info = element.data("user-info")
      window.user = new DiscussionUser(user_info)
      page = element.data("page")
      numPages = element.data("num-pages")
      new DiscussionUserProfileView(el: element, collection: threads, page: page, numPages: numPages)
  $ ->
    $("section.discussion").each (index, elem) ->
      DiscussionApp.start(elem)
    $("section.discussion-user-threads").each (index, elem) ->
      DiscussionProfileApp.start(elem)
