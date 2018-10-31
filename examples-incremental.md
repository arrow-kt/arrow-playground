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
  <script src="../playground.js" data-selector=".language-kotlin"></script>
</head>
<body class="markdown-body">

# Arrow Playground demo

_This is an example document extracted from the Λrrow documentation, to read the actual version please visit: [arrow-kt.io/docs/datatypes/either](https://arrow-kt.io/docs/datatypes/either)_

## Either

In day-to-day programming, it is fairly common to find ourselves writing functions that can fail.
For instance, querying a service may result in a connection issue, or some unexpected JSON response.

To communicate these errors it has become common practice to throw exceptions; however,
exceptions are not tracked in any way, shape, or form by the compiler. To see what
kind of exceptions (if any) a function may throw, we have to dig through the source code.
Then to handle these exceptions, we have to make sure we catch them at the call site. This
all becomes even more unwieldy when we try to compose exception-throwing procedures.

<div class="language-kotlin" data-executable="incremental">

```
import arrow.*
import arrow.core.*

val throwsSomeStuff: (Int) -> Double = {x -> x.toDouble()}
val throwsOtherThings: (Double) -> String = {x -> x.toString()}
val moreThrowing: (String) -> List<String> = {x -> listOf(x)}
val magic = throwsSomeStuff.andThen(throwsOtherThings).andThen(moreThrowing)
magic
```
</div>

Assume we happily throw exceptions in our code. Looking at the types of the above functions, any of them could throw any number of exceptions -- we do not know. When we compose, exceptions from any of the constituent
functions can be thrown. Moreover, they may throw the same kind of exception
(e.g. `IllegalArgumentException`) and thus it gets tricky tracking exactly where an exception came from.

How then do we communicate an error? By making it explicit in the data type we return.

## Either vs Validated

In general, `Validated` is used to accumulate errors, while `Either` is used to short-circuit a computation
upon the first error. For more information, see the `Validated` vs `Either` section of the `Validated` documentation.

By convention the right hand side of an `Either` is used to hold successful values.

<div class="language-kotlin" data-executable="incremental">

```
val right: Either<String, Int> = Either.Right(5)
right
```
</div>

<div class="language-kotlin" data-executable="incremental">

```
val left: Either<String, Int> = Either.Left("Something went wrong")
left
```
</div>
Because `Either` is right-biased, it is possible to define a Monad instance for it.

Since we only ever want the computation to continue in the case of `Right` (as captured by the right-bias nature),
we fix the left type parameter and leave the right one free.

So the map and flatMap methods are right-biased:

<div class="language-kotlin" data-executable="incremental">

```
val right: Either<String, Int> = Either.Right(5)
right.flatMap{Either.Right(it + 1)}
```
</div>

<div class="language-kotlin" data-executable="incremental">

```
val left: Either<String, Int> = Either.Left("Something went wrong")
left.flatMap{Either.Right(it + 1)}
```
</div>

## Using Either instead of exceptions

As a running example, we will have a series of functions that will:

* Parse a string into an integer
* Calculate the reciprocal
* Convert the reciprocal into a string

Using exception-throwing code, we could write something like this:

<div class="language-kotlin" data-executable="incremental">

```
// Exception Style

fun parse(s: String): Int =
    if (s.matches(Regex("-?[0-9]+"))) s.toInt()
    else throw NumberFormatException("$s is not a valid integer.")

fun reciprocal(i: Int): Double =
    if (i == 0) throw IllegalArgumentException("Cannot take reciprocal of 0.")
    else 1.0 / i

fun stringify(d: Double): String = d.toString()
```
</div>

Instead, let's make the fact that some of our functions can fail explicit in the return type.

<div class="language-kotlin" data-executable="incremental">

```
// Either Style

fun parse(s: String): Either<NumberFormatException, Int> =
    if (s.matches(Regex("-?[0-9]+"))) Either.Right(s.toInt())
    else Either.Left(NumberFormatException("$s is not a valid integer."))

fun reciprocal(i: Int): Either<IllegalArgumentException, Double> =
    if (i == 0) Either.Left(IllegalArgumentException("Cannot take reciprocal of 0."))
    else Either.Right(1.0 / i)

fun stringify(d: Double): String = d.toString()

fun magic(s: String): Either<Exception, String> =
    parse(s).flatMap{reciprocal(it)}.map{stringify(it)}

```
</div>

These calls to `parse` returns a `Left` and `Right` value

<div class="language-kotlin" data-executable="incremental">

```
parse("Not a number")
```
</div>

<div class="language-kotlin" data-executable="incremental">

```
parse("2")
```
</div>

Now, using combinators like `flatMap` and `map`, we can compose our functions together.

<div class="language-kotlin" data-executable="incremental">

```
magic("0")
```
</div>

<div class="language-kotlin" data-executable="incremental">

```
magic("1")
```
</div>

<div class="language-kotlin" data-executable="incremental">

```
magic("Not a number")
```
</div>

In the following exercise we pattern-match on every case the `Either` returned by `magic` can be in.
Note the `when` clause in the `Left` - the compiler will complain if we leave that out because it knows that
given the type `Either[Exception, String]`, there can be inhabitants of `Left` that are not
`NumberFormatException` or `IllegalArgumentException`. You should also notice that we are using
[SmartCast](https://kotlinlang.org/docs/reference/typecasts.html#smart-casts) for accessing to `Left` and `Right`
value.

<div class="language-kotlin" data-executable="incremental">

```
val x = magic("2")
val value = when(x) {
    is Either.Left -> when (x.a){
        is NumberFormatException -> "Not a number!"
        is IllegalArgumentException -> "Can't take reciprocal of 0!"
        else -> "Unknown error"
    }
    is Either.Right -> "Got reciprocal: ${x.b}"
}
value
```
</div>

Instead of using exceptions as our error value, let's instead enumerate explicitly the things that
can go wrong in our program.

<div class="language-kotlin" data-executable="incremental">

```
// Either with ADT Style

sealed class Error {
    object NotANumber : Error()
    object NoZeroReciprocal : Error()
}

fun parse(s: String): Either<Error, Int> =
        if (s.matches(Regex("-?[0-9]+"))) Either.Right(s.toInt())
        else Either.Left(Error.NotANumber)

fun reciprocal(i: Int): Either<Error, Double> =
        if (i == 0) Either.Left(Error.NoZeroReciprocal)
        else Either.Right(1.0 / i)

fun stringify(d: Double): String = d.toString()

fun magic(s: String): Either<Error, String> =
        parse(s).flatMap{reciprocal(it)}.map{stringify(it)}
```
</div>

For our little module, we enumerate any and all errors that can occur. Then, instead of using
exception classes as error values, we use one of the enumerated cases. Now when we pattern match,
we are able to comphrensively handle failure without resulting to an `else` branch; moreover
since Error is sealed, no outside code can add additional subtypes which we might fail to handle.

<div class="language-kotlin" data-executable="incremental">

```
val x = magic("2")
when(x) {
    is Either.Left -> when (x.a){
        is Error.NotANumber -> "Not a number!"
        is Error.NoZeroReciprocal -> "Can't take reciprocal of 0!"
    }
    is Either.Right -> "Got reciprocal: ${x.b}"
}
```
</div>

## Syntax

Either can also map over the `left` value with `mapLeft` which is similar to map but applies on left instances.

<div class="language-kotlin" data-executable="incremental">

```
val r : Either<Int, Int> = Either.Right(7)
r.mapLeft {it + 1}
val l: Either<Int, Int> = Either.Left(7)
l.mapLeft {it + 1}
```
</div>

`Either<A, B>` can be transformed to `Either<B,A>` using the `swap()` method.

<div class="language-kotlin" data-executable="incremental">

```
val r: Either<String, Int> = Either.Right(7)
r.swap()
```
</div>

For using Either's syntax on arbitrary data types.
This will make possible to use the `left()`, `right()`, `contains()`, `getOrElse()` and `getOrHandle()` methods:

<div class="language-kotlin" data-executable="incremental">

```
7.right()
```
</div>

<div class="language-kotlin" data-executable="incremental">

```
"hello".left()
```
</div>

<div class="language-kotlin" data-executable="incremental">

```
val x = 7.right()
x.contains(7)
```
</div>

<div class="language-kotlin" data-executable="incremental">

```
val x = "hello".left()
x.getOrElse { 7 }
```
</div>

<div class="language-kotlin" data-executable="incremental">

```
val x = "hello".left()
x.getOrHandle { "$it world!" }
```
</div>

For creating Either instance based on a predicate, use `Either.cond()` method :

<div class="language-kotlin" data-executable="incremental">

```
Either.cond(true, { 42 }, { "Error" })
```
</div>

<div class="language-kotlin" data-executable="incremental">

```
Either.cond(false, { 42 }, { "Error" })
```
</div>

Another operation is `fold`. This operation will extract the value from the Either, or provide a default if the value is `Left`

<div class="language-kotlin" data-executable="incremental">

```
val x : Either<Int, Int> = 7.right()
x.fold({ 1 }, { it + 3 })
```
</div>

<div class="language-kotlin" data-executable="incremental">

```
val y : Either<Int, Int> = 7.left()
y.fold({ 1 }, { it + 3 })
```
</div>

The `getOrHandle()` operation allows the transformation of an `Either.Left` value to a `Either.Right` using
the value of `Left`. This can be useful when a mapping to a single result type is required like `fold()` but without
the need to handle `Either.Right` case.

As an example we want to map an `Either<Throwable, Int>` to a proper HTTP status code:

<div class="language-kotlin" data-executable="incremental">

```
val r: Either<Throwable, Int> = Either.Left(NumberFormatException())
val httpStatusCode = r.getOrHandle {
	when(it) {
		is NumberFormatException -> 400
		else -> 500
	}
} // 400
```
</div>

The ```leftIfNull``` operation transforms a null `Either.Right` value to the specified ```Either.Left``` value.
If the value is non-null, the value wrapped into a non-nullable ```Either.Right``` is returned (very useful to
skip null-check further down the call chain).
If the operation is called on an ```Either.Left```, the same ```Either.Left``` is returned.

See the examples below:

<div class="language-kotlin" data-executable="incremental">

```
Right(12).leftIfNull({ -1 })
```
</div>

<div class="language-kotlin" data-executable="incremental">

```
Right(null).leftIfNull({ -1 })
```
</div>

<div class="language-kotlin" data-executable="incremental">

```
 Left(12).leftIfNull({ -1 })
```
</div>

Another useful operation when working with null is `rightIfNotNull`.
If the value is null it will be transformed to the specified `Either.Left` and if its not null the type will
be wrapped to `Either.Right`.

Example:

<div class="language-kotlin" data-executable="incremental">

```
"value".rightIfNotNull { "left" }
```
</div>

<div class="language-kotlin" data-executable="incremental">

```
null.rightIfNotNull { "left" }
```
</div>


 Arrow contains `Either` instances for many useful typeclasses that allows you to use and transform right values.
 Both Option and Try don't require a type parameter with the following functions, but it is specifically used for Either.Left

 [`Functor`](https://arrow-kt.io/docs/typeclasses/functor/)

 Transforming the inner contents

<div class="language-kotlin" data-executable="incremental">

```
import arrow.instances.*

ForEither<Int>() extensions {
   Right(1).map {it + 1}
}
```
</div>

 [`Applicative`](https://arrow-kt.io/docs/typeclasses/applicative/)

 Computing over independent values

<div class="language-kotlin" data-executable="incremental">

```
ForEither<Int>() extensions {
  tupled(Either.Right(1), Either.Right("a"), Either.Right(2.0))
}
```
</div>

 [`Monad`](https://arrow-kt.io/docs/typeclasses/monad/)

 Computing over dependent values ignoring absence

<div class="language-kotlin" data-executable="incremental">

```
ForEither<Int>() extensions {
 binding {
    val a = Either.Right(1).bind()
    val b = Either.Right(1 + a).bind()
    val c = Either.Right(1 + b).bind()
    a + b + c
 }
}
// Right(6)
```
</div>

## Available Instances

* [Show](https://arrow-kt.io/docs/typeclasses/show)
* [Eq](https://arrow-kt.io/docs/typeclasses/eq)
* [Applicative](https://arrow-kt.io/docs/typeclasses/applicative)
* [ApplicativeError](https://arrow-kt.io/docs/typeclasses/applicativeerror)
* [Foldable](https://arrow-kt.io/docs/typeclasses/foldable)
* [Functor](https://arrow-kt.io/docs/typeclasses/functor)
* [Bifunctor](https://arrow-kt.io/docs/typeclasses/bifunctor)
* [Monad](https://arrow-kt.io/docs/typeclasses/monad)
* [MonadError](https://arrow-kt.io/docs/typeclasses/monaderror)
* [SemigroupK](https://arrow-kt.io/docs/typeclasses/semigroupk)
* [Traverse](https://arrow-kt.io/docs/typeclasses/traverse)
* [TraverseFilter](https://arrow-kt.io/docs/typeclasses/traversefilter)
* [Each](https://arrow-kt.io/docs/optics/each)


</body>
</html>
