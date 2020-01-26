---
layout: post
title:  "Forward pipe operator in F#"
date:   2020-01-26
---
Recently I started an introduction [series](https://www.youtube.com/playlist?list=PLEoMzSkcN8oNiJ67Hd7oRGgD1d4YBxYGC) about F#.
At the end of the first video, I wanted to know more about the forward pipe operator (|>).
Here are some of the findings I discovered while experimenting with the operator:

## What is it?
The forward pipe operator is used for chaining functions so that you can use the result of a previous function into the next function.
For future references I will use the term pipe operator, without the forward. There is also a backward pipe operator which I will not cover here.

### An example
I created a list of strings named `names` and two functions. A function `helloName` which puts 'Hello, ' in front of the name, and a function `exclaimName` which puts a '!' at the end of the name.  

{% highlight fsharp %}
let names = ["David"; "Maria"; "Alex"]

let helloName name = "Hello, " + name
let exclaimName name = name + "!"
{% endhighlight %}

Next I will use `Seq.map` (a mapper function, similar to C# LINQ `Select` method) to map both these functions to the names in the list to create new lists.

{% highlight fsharp %}
let namesWithHello = Seq.map helloName names
let namesWithHelloAndExclaim = Seq.map exclaimName namesWithHello
{% endhighlight %}

The result of `namesWithHelloAndExclaim` is as follows:

{% highlight fsharp %}
["Hello, David!"; "Hello, Maria!"; "Hello, Alex!"]
{% endhighlight %}

> Notice that the method signature of Seq.map is slightly different than Enumerable.Select in C#.  
Seq.map takes a function as first parameter and a list as second whereas Enumerable.Select takes a list as first parameter and a function as second.
The reason for this will become more clear later on.

### Shorten it up
The use of variables for each function mapping is a bit verbose. We can rewrite this as a one-liner.

{% highlight fsharp %}
let namesWithHelloAndExclaim = Seq.map exclaimName (Seq.map helloName names)
{% endhighlight %}

This is a bit better. We no longer have to write a variable per function. But now the use of parenthesis makes it harder to follow the flow and to understand which part of the code gets executed first.

### Pipe operator to the rescue!
We can use the pipe operator to chain functions to our list of names.  

{% highlight fsharp %}
let namesWithHelloAndExclaim =
   names
   |> Seq.map helloName
   |> Seq.map exclaimName
{% endhighlight %}

We can now see the flow in which the functions are executed more explicitly. `names` is used as input for `Seq.map helloName` and the result is used in turn for `Seq.map exclaimName`.

## Writing our own
When hovering over the pipe operator we can see its method signature:

{% highlight fsharp %}
val ( |> ): 'T -> ('T -> 'U) -> 'U
{% endhighlight %}

This means this function has two inputs and one output:  
- Input `'T` = a generic type `'T`
- Input `('T -> 'U)` = a function that has generic type `'T` as input and a generic type `'U` as output
- Output `'U` = a generic type `'U`

When we define parameters for the input
- x = `'T`
- f = `('T -> 'U)`

we have the beginning of our own pipe function:

{% highlight fsharp %}
let pipe x f = ...
{% endhighlight %}

How do we calculate the output `'U`? We use the function `('T -> 'U)` with `'T` as input to get `'U`.

This translates to:

{% highlight fsharp %}
let pipe x f = f x
{% endhighlight %}

We can now test our own `pipe` function:

{% highlight fsharp %}
let namesWithHello =
   pipe names (Seq.map helloName)
{% endhighlight %}

But this is not completely the same as the pipe operator. The `pipe` and the `names` are in a different order. This was the pipeline implementation:

{% highlight fsharp %}
let namesWithHello = 
   names |> (Seq.map helloName)
{% endhighlight %}

So we should write it as:

{% highlight fsharp %}
let namesWithHello =
   names pipe (Seq.map helloName)
{% endhighlight %}

But this doesn't compile. What's going on here?

## Operators
An operator is a symbol that is used for composing values or functions.
You could see it as an alias for a function.

There are two types of operators, `prefix` and `infix`. `Prefix` operators are operators that can be placed in front of operands.
`Infix` operators are operators that can be placed in between operands.
Some operators are prefix operators, some are infix operators, and others can be both.

The pipe operator is both a prefix and an infix operator, which means you can do the following:

{% highlight fsharp %}
let prefixPipeOperator =
   (|>) names (Seq.map helloName)
{% endhighlight %}

And also this:

{% highlight fsharp %}
let infixPipeOperator = 
   names |> Seq.map helloName
{% endhighlight %}

> The arithemetic operators are also prefix and infix operators. This means you can write your expression as 1 + 1 or as (+) 1 1.

## Back to our implementation
Now that we know this we can write our own operator.

{% highlight fsharp %}
let (<*>) x f = f x
{% endhighlight %}

And test it:

{% highlight fsharp %}
let namesWithHelloAndExclaim =
   names
   <*> Seq.map helloName
   <*> Seq.map exclaimName
{% endhighlight %}

{% highlight fsharp %}
["Hello, David!"; "Hello, Maria!"; "Hello, Alex!"]
{% endhighlight %}

Cool, it works!

## C# implementation
When learning a new language it helps to take the things you've learned and apply it to a language you're familiar with.
My go-to language is C#, so I will create an implementation of the pipe operator in C#.

### Setting things up
Let's create the `Seq.Map` function. I am using the LINQ Select method as implementation because it basically does the same thing.

{% highlight csharp %}
public static class Seq
{
   public static IEnumerable<TOutput> Map<TInput, TOutput>(Func<TInput, TOutput> map, IEnumerable<TInput> list)
      => list.Select(map);
}
{% endhighlight %}

As far as I know there is no functionality in C# to create a new public operator, so I will use an extension method for the `Pipe` method. 

{% highlight csharp %}
public static class Extensions
{
   public static U Pipe<T, U>(this T input, Func<T, U> func)
      => func(input);
}
{% endhighlight %}

And the helper methods:

{% highlight csharp %}
private static string PrefixWithHello(string str)
   => "Hello, " + str;
{% endhighlight %}

{% highlight csharp %}
private static string Exclaim(string str)
   => str + "!";
{% endhighlight %}

### Testing it
Time to test it.

{% highlight csharp %}
var names = new[] { "David", "Maria", "Alex" };

var namesWithHelloAndExclaim =
   names
   .Pipe(list => Seq.Map(PrefixWithHello, list))
   .Pipe(list => Seq.Map(Exclaim, list));

foreach(var name in namesWithHelloAndExclaim)
{
   Console.WriteLine(name);
}
{% endhighlight %}

It prints:

{% highlight csharp %}
Hello, David!
Hello, Maria!
Hello, Alex!
{% endhighlight %}

Okay, that works. But if you look closely you can see that there is a difference between the F# and the C# implementation.
In the C# implementation we have to specify `list` in every pipe method. The F# implementation doesn't have this.

How can we get rid of the list parameter?

## Back to F#
This was our implementation in F#:

{% highlight fsharp %}
let namesWithHelloAndExclaim =
   names
   |> Seq.map helloName
   |> Seq.map exclaimName
{% endhighlight %}

Let's make it more verbose and write out the lambda function.

{% highlight fsharp %}
let namesWithHelloAndExclaim =
   names
   |> (fun list -> Seq.map helloName list)
   |> (fun list -> Seq.map exclaimName list)
{% endhighlight %}

Now we can see our `list` parameter of the lambda function. Let's add some more verbosity by adding parenthesis.

{% highlight fsharp %}
let namesWithHelloAndExclaim =
   names
   |> (fun list -> Seq.map(helloName)(list))
   |> (fun list -> Seq.map(exclaimName)(list))
{% endhighlight %}

Here we can see the magic. We have two functions; our Seq.map which now has one input instead of two, and a `new function` that takes a list as input.  
 `Seq.map` is transformed from a function that takes a mapping function and a list and returns a list, to a function that takes a mapping function and returns a new function that takes a list and returns a list. Wow, that's a mouthful.  

Here is the summary:  

{% highlight fsharp %}
Seq.map helloName list
{% endhighlight %}

- Input: mapping function that maps generic type 'T to generic type 'U
- Input: list of 'T
- Output: list of 'U

{% highlight fsharp %}
Seq.map helloName
{% endhighlight %}

- Input: mapping function that maps generic type 'T to generic type 'U
- Output: a new function that takes a list of 'T and returns a list of 'U

In F#, functions of multiple inputs can be split into multiple functions of one input. This process is called `currying`. Every function is curried by default. Creating a new function with fewer input from a curried function is called `partial application`.   

And because we have a list at the left hand side of the expression, and a list at the right hand side, we can remove these two. Just like in math. This is why the `order` of the parameters is important in functions and also the reason why the list is the `last` parameter in the Seq.map function.

## Back to C#
We can apply our new knowledge of currying to C#. We can write a new Seq.Map method that returns a `new function` instead of returning a list.

{% highlight csharp %}
public static class Seq
{
   //old method
   public static IEnumerable<TOutput> Map<TInput, TOutput>(Func<TInput, TOutput> map, IEnumerable<TInput> list)
      => list.Select(map);
	
   //new method	
   public static Func<IEnumerable<TInput>, IEnumerable<TOutput>> Map<TInput, TOutput>(Func<TInput, TOutput> map)
      => list => list.Select(map);
}
{% endhighlight %}

With this new method we can change our implementation from:

{% highlight csharp %}
var namesWithHelloAndExclaim =
   names
   .Pipe(list => Seq.Map(PrefixWithHello, list))
   .Pipe(list => Seq.Map(Exclaim, list));
{% endhighlight %}

to:

{% highlight csharp %}
var namesWithHelloAndExclaim =
   names
   .Pipe(list => Seq.Map(PrefixWithHello)(list))
   .Pipe(list => Seq.Map(Exclaim)(list));
{% endhighlight %}

Unfortunatly this doesn't compile. The compiler cannot infer the types from usage. This is a limitation in the C# compiler. We need to explicitly provide the generic parameters.

{% highlight csharp %}
var namesWithHelloAndExclaim =
   names
   .Pipe(list => Seq.Map<string, string>(PrefixWithHello)(list))
   .Pipe(list => Seq.Map<string, string>(Exclaim)(list));
{% endhighlight %}

But the good news is that we can now remove the list parameter.

{% highlight csharp %}
var namesWithHelloAndExclaim =
   names
   .Pipe(Seq.Map<string, string>(PrefixWithHello))
   .Pipe(Seq.Map<string, string>(Exclaim));
{% endhighlight %}

> Another option is to replace the generic types in the Seq.Map method with strings. But this will create a specific implementation for strings instead of a generic implementation.

## Summary
- The pipe operator can be used to chain functions so that you have the result of the previous function in the next function
- Operators have different types that define the position in which they are placed between operands
- We can reduce code by
  - Changing the order of function parameters
  - Making use of partial application on a curried function