<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Arrow Playground examples</title>
  <link rel="stylesheet" href="examples.css">
  <link rel="stylesheet" href="examples-highlight.css">
  <style>
  .markdown-body {
		max-width: 980px;
		margin: 50px auto;
	}
  </style>
  <script src="../playground.js" data-selector=".kotlin-code"></script>
</head>
<body class="markdown-body">

# Arrow Playground demo

## Automatic initialization

Insert a `<script>` element into your page and specify what elements should be converted in its `data-selector` attribute.
```html
<script src="https://unpkg.com/arrow-playground@1" data-selector=".kotlin-code"></script>
```

For instance following block of Kotlin code:

```txt
class Contact(val id: Int, var email: String)

fun main(args: Array<String>) {
    val contact = Contact(1, "mary@gmail.com")
    println(contact.id)                   
}
```

Turns into:

<div class="kotlin-code">

```kotlin
class Contact(val id: Int, var email: String)

fun main(args: Array<String>) {
    val contact = Contact(1, "mary@gmail.com")
    println(contact.id)
}
```

</div>

You can also change the playground theme or disable run button using `theme` and `data-highlight-only` attributes.

```html
<div class="kotlin-code" theme="idea" data-highlight-only></div>
``` 
<div class="kotlin-code" data-highlight-only theme="idea">

```kotlin
fun main(args: Array<String>) {
    println("Hello World!")
}
```

</div>

Or theme `darcula`

<div class="kotlin-code" data-highlight-only theme="darcula">

```kotlin
fun main(args: Array<String>) {
    println("Hello World!")
}
```

</div>

## Manual initialization

If you want to init Arrow Playground manually - omit `data-selector` attribute and call it when it's needed:

```html
<script src="https://unpkg.com/arrow-playground@1"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
  ArrowPlayground('.arrow-playground');
});
</script>
```
Add additional hidden files:
Put your files between `<textarea>` tag with class `hidden-dependency`.

Look at example:


```html

<div class="arrow-playground">
  import cat.Cat

  fun main(args: Array<String>) {
  //sampleStart
      val cat = Cat("Kitty")
      println(cat.name)  
  //sampleEnd                 
  }
  <textarea class="hidden-dependency">
    package cat
    class Cat(val name: String)
  </textarea>
</div>
```

<button onclick="ArrowPlayground('.kotlin-code-2',{ onChange: (code)=> {console.log(code)}}); this.disabled = true; document.getElementById('kotlin-example').style.display = 'block';">Create</button>

<div id="kotlin-example" class="kotlin-code-2" style="display: none;">

```text
import cat.Cat

fun main(args: Array<String>) {
//sampleStart
    val cat = Cat("Kitty")
    println(cat.name)
//sampleEnd
}
```
  <textarea class="hidden-dependency">
    package cat
    class Cat(val name: String)
  </textarea>

</div>

</body>
</html>
