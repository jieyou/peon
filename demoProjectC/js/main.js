$(function(){
	var $searchContaier = $('#searchContaier')
	var $searchInput = $('#searchInput')

	var $listContainer = $('#listContainer')
	var $goBackInList = $('#goBackInList')

	var $contentContainer = $('#contentContainer')
	var $goBackInContent = $('#goBackInContent')

	var $loadingMask = $('#loadingMask')

	// compile
	var listTpl = _.template($('#listTpl').html())
	var contentTpl = _.template($('#contentTpl').html())

	var dataCache = {} // todo:通用cache模块
	
	function buildList(list,search){
		$listContainer.html(
			listTpl({
				list:list,
				search:search
			})
		)
		showListSH(!!search)
	}

	function showContentSH(){
		$contentContainer.show()
		$goBackInContent.show()
		$searchContaier.hide()
		$listContainer.hide()
		$goBackInList.hide()
	}

	function showListSH(showGoBack){
		$contentContainer.hide()
		$goBackInContent.hide()
		$searchContaier.show()
		$listContainer.show()
		$goBackInList.toggle(showGoBack)
	}

	function setMaskHeight(){
		$loadingMask.css('height',window.innerHeight)
	}

	function getContent(src,title){
		if(dataCache[src]){
			$contentContainer.html(
				contentTpl({
					title:title,
					content:dataCache[src]
				})
			)
			showContentSH()
		}else{
			$loadingMask.show()
			$.ajax({
				url:'others/'+src+'.html', // cdn
				dataType:'html',
				success:function(content){
					dataCache[src] = content
					$contentContainer.html(
						contentTpl({
							title:title,
							content:content
						})
					)
					showContentSH()
					$loadingMask.hide()
				},
				cache:false
			})
		}
	}

	buildList(faqList)
	setMaskHeight()

	$(window).on('resize',setMaskHeight)

	$searchContaier.on('submit',function(){
		var val = $.trim($searchInput.val())
		if(val){
			buildList(
				_.filter(faqList,function(e){
					return e.title.indexOf(val) != -1
				})
			,val)
		}else{
			buildList(faqList)
		}
		return false
	})

	$listContainer.on('click','li',function(){
		var $this = $(this)
		getContent($this.data('src'),$this.data('title'))
	})

	$goBackInContent.on('click',function(){
		$searchContaier.trigger('submit')
	})

	$goBackInList.on('click',function(){
		$searchInput.val('')
		buildList(faqList)
	})
})